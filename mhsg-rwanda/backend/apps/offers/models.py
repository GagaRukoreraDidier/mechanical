import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from apps.requests.models import ServiceRequest
from apps.providers.models import ProviderProfile

class ProviderOffer(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", _("Draft")
        SUBMITTED = "SUBMITTED", _("Submitted")
        REVISED = "REVISED", _("Revised")
        WITHDRAWN = "WITHDRAWN", _("Withdrawn")
        SELECTED = "SELECTED", _("Selected by Admin")
        REJECTED = "REJECTED", _("Not Selected")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(
        ServiceRequest,
        on_delete=models.CASCADE,
        related_name="offers",
    )
    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name="offers",
    )
    price_min_rwf = models.BigIntegerField(_("minimum price (RWF)"), null=True, blank=True)
    price_max_rwf = models.BigIntegerField(_("maximum price (RWF)"), null=True, blank=True)
    currency = models.CharField(max_length=3, default="RWF")
    scope = models.TextField(_("scope of work or item breakdown"))
    availability = models.CharField(_("provider availability"), max_length=255)
    estimated_lead_time = models.CharField(_("estimated delivery or completion time"), max_length=100)
    stock_status = models.CharField(_("stock status"), max_length=50, blank=True)
    item_condition = models.CharField(_("part condition"), max_length=50, blank=True)
    warranty_terms = models.TextField(_("warranty terms"), blank=True)
    limitations = models.TextField(_("limitations and exclusions"), blank=True)
    status = models.CharField(
        _("status"),
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED,
    )
    is_genuine_confirmed = models.BooleanField(
        _("provider confirms quotation is genuine and current"),
        default=True,
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    revised_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("provider offer")
        verbose_name_plural = _("provider offers")
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"Offer from {self.provider.display_name} for {self.request} ({self.status})"


class ProviderSelection(models.Model):
    class CustomerDecision(models.TextChoices):
        PENDING = "PENDING", _("Pending Customer Review")
        APPROVED = "APPROVED", _("Approved by Customer")
        REJECTED = "REJECTED", _("Rejected by Customer")
        NO_RESPONSE = "NO_RESPONSE", _("No Response (Timed Out)")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.OneToOneField(
        ServiceRequest,
        on_delete=models.CASCADE,
        related_name="selection",
    )
    selected_offer = models.ForeignKey(
        ProviderOffer,
        on_delete=models.CASCADE,
        related_name="selections",
    )
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="provider_selections_made",
    )
    rationale = models.TextField(_("admin recommendation rationale"))
    customer_decision = models.CharField(
        _("customer decision"),
        max_length=20,
        choices=CustomerDecision.choices,
        default=CustomerDecision.PENDING,
    )
    admin_selected_at = models.DateTimeField(auto_now_add=True)
    customer_decided_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("provider selection")
        verbose_name_plural = _("provider selections")

    def __str__(self):
        return f"Selection for {self.request}: {self.selected_offer.provider.display_name}"
