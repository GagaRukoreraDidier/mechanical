from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Connection
from .serializers import ConnectionSerializer
from .services import ConnectionService
from apps.requests.models import ServiceRequest
from apps.requests.services import RequestService
from apps.accounts.permissions import IsAdminUserRole

class ConnectionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ConnectionSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Connection.objects.none()
        if user.is_admin_user:
            return Connection.objects.select_related("request__customer", "provider", "request__protected_address_ref").all()
        if hasattr(user, "provider_profile"):
            return Connection.objects.filter(provider=user.provider_profile).select_related("request__customer", "request__protected_address_ref")
        return Connection.objects.filter(request__customer=user).select_related("provider")

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def report_outcome(self, request, pk=None):
        conn = self.get_object()
        user = request.user
        # Must be customer or provider of this connection, or admin
        is_party = (conn.request.customer == user) or (hasattr(user, "provider_profile") and conn.provider == user.provider_profile)
        if not (is_party or user.is_admin_user):
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        outcome = request.data.get("outcome")
        notes = request.data.get("notes", "")

        if outcome in Connection.Outcome.values:
            conn.outcome = outcome
            conn.outcome_notes = notes
            conn.outcome_reported_at = timezone.now()
            conn.save(update_fields=["outcome", "outcome_notes", "outcome_reported_at", "updated_at"])

            # Sync request status if completed or in progress
            req_obj = conn.request
            if outcome == Connection.Outcome.COMPLETED:
                RequestService.transition(req_obj, ServiceRequest.Status.COMPLETED, actor=user, reason="Outcome marked completed.")
            elif outcome == Connection.Outcome.IN_PROGRESS:
                RequestService.transition(req_obj, ServiceRequest.Status.IN_PROGRESS_OR_ARRANGED, actor=user, reason="Work/supply in progress.")
            elif outcome == Connection.Outcome.DISPUTED:
                RequestService.transition(req_obj, ServiceRequest.Status.REPORTED, actor=user, reason="Reported by party: " + notes)

            return Response(self.get_serializer(conn).data)
        return Response({"detail": "Invalid outcome value."}, status=status.HTTP_400_BAD_REQUEST)
