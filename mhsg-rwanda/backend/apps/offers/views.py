from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from .models import ProviderOffer, ProviderSelection
from .serializers import ProviderOfferSerializer, ProviderSelectionSerializer
from apps.requests.models import ServiceRequest, ProviderInvitation
from apps.requests.services import RequestService
from apps.accounts.permissions import IsAdminUserRole

class ProviderOfferViewSet(viewsets.ModelViewSet):
    serializer_class = ProviderOfferSerializer
    filterset_fields = ["request", "status"]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ProviderOffer.objects.none()
        if user.is_admin_user:
            return ProviderOffer.objects.select_related("provider", "request").all()
        if hasattr(user, "provider_profile"):
            return ProviderOffer.objects.filter(provider=user.provider_profile)
        # Customer sees offers if request status allows comparison
        return ProviderOffer.objects.filter(
            request__customer=user,
            request__status__in=[
                ServiceRequest.Status.AWAITING_CUSTOMER_APPROVAL,
                ServiceRequest.Status.CUSTOMER_APPROVED,
                ServiceRequest.Status.AWAITING_CONNECTION_PAYMENT,
                ServiceRequest.Status.CONNECTION_UNLOCKED,
                ServiceRequest.Status.CONNECTED,
                ServiceRequest.Status.IN_PROGRESS_OR_ARRANGED,
                ServiceRequest.Status.COMPLETED,
            ]
        )

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, "provider_profile"):
            raise permissions.exceptions.PermissionDenied("Only providers can submit offers.")
        provider = user.provider_profile
        req_obj = serializer.validated_data["request"]

        # Check invitation
        invitation = ProviderInvitation.objects.filter(
            publication__request=req_obj,
            provider=provider,
        ).first()
        if not invitation:
            raise permissions.exceptions.PermissionDenied("You must be invited to submit an offer for this request.")

        offer = serializer.save(provider=provider, status=ProviderOffer.Status.SUBMITTED)
        invitation.status = ProviderInvitation.Status.ACCEPTED
        invitation.save(update_fields=["status"])

        # If request was PUBLISHED, transition to OFFERS_RECEIVED
        if req_obj.status == ServiceRequest.Status.PUBLISHED:
            RequestService.transition(
                req_obj,
                ServiceRequest.Status.OFFERS_RECEIVED,
                actor=user,
                reason=f"Offer received from provider {provider.display_name}.",
            )

    @action(detail=False, methods=["post"], permission_classes=[IsAdminUserRole])
    @transaction.atomic
    def select_offer(self, request):
        offer_id = request.data.get("offer_id")
        rationale = request.data.get("rationale", "")
        try:
            offer = ProviderOffer.objects.select_related("request", "provider").get(id=offer_id)
        except ProviderOffer.DoesNotExist:
            return Response({"detail": "Offer not found."}, status=status.HTTP_404_NOT_FOUND)

        req_obj = offer.request
        # Update or create selection
        selection, _ = ProviderSelection.objects.update_or_create(
            request=req_obj,
            defaults={
                "selected_offer": offer,
                "admin": request.user,
                "rationale": rationale,
                "customer_decision": ProviderSelection.CustomerDecision.PENDING,
            }
        )

        # Mark offer as SELECTED
        offer.status = ProviderOffer.Status.SELECTED
        offer.save(update_fields=["status"])

        # Transition request status
        RequestService.transition(
            req_obj,
            ServiceRequest.Status.AWAITING_CUSTOMER_APPROVAL,
            actor=request.user,
            reason=f"Admin selected provider {offer.provider.display_name}. Sent to customer for approval.",
        )

        return Response(ProviderSelectionSerializer(selection).data)
