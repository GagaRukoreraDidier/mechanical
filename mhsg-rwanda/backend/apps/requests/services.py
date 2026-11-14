import uuid
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import (
    ServiceRequest,
    RequestStatusHistory,
    RequestPublication,
    ProviderInvitation,
)
from apps.providers.models import ProviderProfile

class RequestService:
    @staticmethod
    def transition(request_obj: ServiceRequest, new_status: str, actor=None, reason: str = ""):
        """Transitions request to a new status with validation and status history recording."""
        old_status = request_obj.status
        request_obj.status = new_status
        if new_status == ServiceRequest.Status.SUBMITTED and not request_obj.submitted_at:
            request_obj.submitted_at = timezone.now()
        if new_status == ServiceRequest.Status.PUBLISHED and not request_obj.published_at:
            request_obj.published_at = timezone.now()

        request_obj.save(update_fields=["status", "submitted_at", "published_at", "updated_at"])

        RequestStatusHistory.objects.create(
            request=request_obj,
            previous_status=old_status,
            new_status=new_status,
            actor=actor,
            reason=reason,
        )
        return request_obj

    @classmethod
    @transaction.atomic
    def submit_request(cls, request_obj: ServiceRequest, actor):
        if request_obj.status != ServiceRequest.Status.DRAFT:
            raise ValidationError(f"Cannot submit request in {request_obj.status} status.")
        
        # In configured free pilot or if fee is already handled, can transition directly to SUBMITTED
        return cls.transition(
            request_obj,
            ServiceRequest.Status.AWAITING_REQUEST_PAYMENT,
            actor=actor,
            reason="Submitted by customer, awaiting activation fee payment confirmation.",
        )

    @classmethod
    @transaction.atomic
    def confirm_activation_fee(cls, request_obj: ServiceRequest, actor=None):
        request_obj.fee_status = ServiceRequest.FeeStatus.SUCCEEDED
        request_obj.save(update_fields=["fee_status", "updated_at"])

        return cls.transition(
            request_obj,
            ServiceRequest.Status.SUBMITTED,
            actor=actor,
            reason="Request activation fee verified. Ready for administrator review.",
        )

    @classmethod
    @transaction.atomic
    def admin_review_decision(cls, request_obj: ServiceRequest, decision: str, admin_user, reason: str = ""):
        valid_transitions = {
            "start_review": ServiceRequest.Status.UNDER_REVIEW,
            "needs_info": ServiceRequest.Status.NEEDS_INFORMATION,
            "reject": ServiceRequest.Status.REJECTED,
            "ready_to_publish": ServiceRequest.Status.READY_TO_PUBLISH,
        }
        if decision not in valid_transitions:
            raise ValidationError(f"Invalid review decision: {decision}")

        return cls.transition(
            request_obj,
            valid_transitions[decision],
            actor=admin_user,
            reason=reason,
        )

    @classmethod
    @transaction.atomic
    def publish_request(cls, request_obj: ServiceRequest, admin_user, target_provider_ids=None, filter_criteria=None, expiry_hours=48):
        if request_obj.status not in [ServiceRequest.Status.READY_TO_PUBLISH, ServiceRequest.Status.UNDER_REVIEW]:
            raise ValidationError("Request is not ready for publication.")

        now = timezone.now()
        deadline = now + timezone.timedelta(hours=expiry_hours)

        publication = RequestPublication.objects.create(
            request=request_obj,
            target_group_filter=filter_criteria or {},
            published_by=admin_user,
            expiry=deadline,
        )

        providers_to_invite = []
        if target_provider_ids:
            providers_to_invite = ProviderProfile.objects.filter(id__in=target_provider_ids, is_active=True, is_suspended=False)
        else:
            # Broadcast to eligible active providers in the district and matching category
            providers_to_invite = ProviderProfile.objects.filter(
                is_active=True,
                is_suspended=False,
                locations__district__iexact=request_obj.district,
            ).distinct()

        for provider in providers_to_invite:
            ProviderInvitation.objects.get_or_create(
                publication=publication,
                provider=provider,
                defaults={"response_deadline": deadline},
            )

        return cls.transition(
            request_obj,
            ServiceRequest.Status.PUBLISHED,
            actor=admin_user,
            reason=f"Published to {len(providers_to_invite)} eligible provider(s).",
        )

    @classmethod
    @transaction.atomic
    def customer_approval(cls, request_obj: ServiceRequest, customer_user, approved: bool, reason: str = ""):
        if request_obj.customer != customer_user:
            raise ValidationError("Only the requester can approve or reject the recommendation.")

        if approved:
            cls.transition(
                request_obj,
                ServiceRequest.Status.CUSTOMER_APPROVED,
                actor=customer_user,
                reason="Customer approved recommended provider. Awaiting connection fee.",
            )
            return cls.transition(
                request_obj,
                ServiceRequest.Status.AWAITING_CONNECTION_PAYMENT,
                actor=customer_user,
                reason="Provider notified to confirm connection fee.",
            )
        else:
            return cls.transition(
                request_obj,
                ServiceRequest.Status.OFFERS_RECEIVED,
                actor=customer_user,
                reason=f"Customer rejected proposed provider: {reason}. Returned to offers.",
            )
