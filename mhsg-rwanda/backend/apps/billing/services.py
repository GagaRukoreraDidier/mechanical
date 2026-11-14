import uuid
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Payment, FinancialEvent, FeeConfiguration
from apps.requests.models import ServiceRequest
from apps.requests.services import RequestService
from apps.connections.models import Connection
from apps.connections.services import ConnectionService

class PaymentService:
    @staticmethod
    def get_configured_fee(fee_type: str, category=None) -> int:
        """Looks up active FeeConfiguration, or returns default pilot pricing."""
        today = timezone.now().date()
        fee_config = None
        if category:
            fee_config = FeeConfiguration.objects.filter(
                fee_type=fee_type,
                category=category,
                is_active=True,
                effective_from__lte=today,
            ).filter(
                effective_to__isnull=True
            ).first()

        if not fee_config:
            fee_config = FeeConfiguration.objects.filter(
                fee_type=fee_type,
                category__isnull=True,
                is_active=True,
                effective_from__lte=today,
            ).filter(
                effective_to__isnull=True
            ).first()

        if fee_config:
            return fee_config.amount_rwf

        # Default fallback pilot prices (RWF)
        if fee_type == FeeConfiguration.FeeType.REQUEST_FEE:
            return 1000
        elif fee_type == FeeConfiguration.FeeType.CONNECTION_FEE:
            return 2500
        return 0

    @classmethod
    @transaction.atomic
    def create_payment_intent(cls, payer, purpose: str, related_obj, amount_rwf: int, provider="SANDBOX"):
        related_object_type = related_obj.__class__.__name__.lower()
        idempotency_key = f"{payer.id}:{purpose}:{related_object_type}:{related_obj.id}"

        # If a pending or created payment already exists, return it
        existing = Payment.objects.filter(
            idempotency_key=idempotency_key,
            status__in=[Payment.Status.CREATED, Payment.Status.PENDING],
        ).first()
        if existing:
            return existing

        payment = Payment.objects.create(
            payer=payer,
            purpose=purpose,
            related_object_type=related_object_type,
            related_object_id=related_obj.id,
            amount_rwf=amount_rwf,
            currency="RWF",
            payment_provider=provider,
            status=Payment.Status.PENDING,
            idempotency_key=idempotency_key,
        )

        FinancialEvent.objects.create(
            payment=payment,
            event_type="intent_created",
            amount_rwf=amount_rwf,
            before_status="NONE",
            after_status=Payment.Status.PENDING,
            actor=payer,
        )

        return payment

    @classmethod
    @transaction.atomic
    def handle_payment_success(cls, payment: Payment, external_ref: str, raw_payload=None, actor=None):
        """Processes verified successful payment callback idempotently."""
        if payment.status == Payment.Status.SUCCEEDED:
            return payment  # Idempotent: already processed

        before_status = payment.status
        payment.status = Payment.Status.SUCCEEDED
        payment.external_reference = external_ref
        payment.provider_response = raw_payload or {}
        payment.succeeded_at = timezone.now()
        payment.save(update_fields=["status", "external_reference", "provider_response", "succeeded_at", "updated_at"])

        FinancialEvent.objects.create(
            payment=payment,
            event_type="payment_succeeded",
            amount_rwf=payment.amount_rwf,
            before_status=before_status,
            after_status=Payment.Status.SUCCEEDED,
            actor=actor,
            metadata={"external_reference": external_ref},
        )

        # Trigger corresponding marketplace workflow
        if payment.purpose == Payment.Purpose.REQUEST_FEE:
            try:
                req = ServiceRequest.objects.get(id=payment.related_object_id)
                RequestService.confirm_activation_fee(req, actor=actor)
            except ServiceRequest.DoesNotExist:
                pass

        elif payment.purpose == Payment.Purpose.CONNECTION_FEE:
            try:
                conn = Connection.objects.get(id=payment.related_object_id)
                ConnectionService.unlock_connection(conn, actor=actor, reason="Connection fee paid and verified.")
            except Connection.DoesNotExist:
                pass

        return payment
