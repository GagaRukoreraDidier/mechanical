import uuid
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Connection
from apps.requests.models import ServiceRequest
from apps.requests.services import RequestService
from apps.audit.services import AuditService

class ConnectionService:
    @classmethod
    @transaction.atomic
    def create_connection_for_request(cls, request_obj: ServiceRequest, provider):
        """Creates connection record after customer approval."""
        connection, created = Connection.objects.get_or_create(
            request=request_obj,
            provider=provider,
            defaults={
                "connection_status": Connection.Status.PENDING_PAYMENT,
                "unlocked_fields": [],
            }
        )
        return connection

    @classmethod
    @transaction.atomic
    def unlock_connection(cls, connection: Connection, actor=None, reason="Connection fee verified"):
        """
        Unlocks customer authorized details to provider ONLY after payment or waiver is verified.
        Strict privacy by default.
        """
        if connection.connection_status == Connection.Status.ACTIVE:
            return connection  # already unlocked, idempotent

        req_obj = connection.request
        customer = req_obj.customer

        # Check customer consent to determine exact fields to release
        unlocked = []
        if getattr(customer, "phone_consent", False):
            unlocked.append("phone")
        
        # Check if customer address consent is granted
        addr = req_obj.protected_address_ref
        if addr and (getattr(customer, "address_consent", False) or getattr(addr, "address_consent", False)):
            unlocked.append("address")
            unlocked.append("map_pin")

        # Always permit in-app messaging
        unlocked.append("in_platform_messaging")

        connection.unlocked_fields = unlocked
        connection.unlocked_at = timezone.now()
        connection.connection_status = Connection.Status.ACTIVE
        connection.save(update_fields=["unlocked_fields", "unlocked_at", "connection_status", "updated_at"])

        # Transition request status
        RequestService.transition(
            req_obj,
            ServiceRequest.Status.CONNECTION_UNLOCKED,
            actor=actor,
            reason=f"Connection fee verified. Authorized fields unlocked: {', '.join(unlocked)}.",
        )
        RequestService.transition(
            req_obj,
            ServiceRequest.Status.CONNECTED,
            actor=actor,
            reason="Parties successfully connected.",
        )

        # Audit log
        AuditService.log_event(
            actor=actor,
            action="connection.unlocked",
            object_type="Connection",
            object_id=str(connection.id),
            before_data={"status": Connection.Status.PENDING_PAYMENT},
            after_data={
                "status": Connection.Status.ACTIVE,
                "unlocked_fields": unlocked,
                "provider_id": str(connection.provider.id),
                "request_id": str(req_obj.id),
            },
        )

        return connection
