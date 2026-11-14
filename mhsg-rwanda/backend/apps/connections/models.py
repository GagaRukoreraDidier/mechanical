import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.requests.models import ServiceRequest
from apps.providers.models import ProviderProfile

class Connection(models.Model):
    class Status(models.TextChoices):
        PENDING_PAYMENT = "PENDING_PAYMENT", _("Awaiting Connection Payment")
        ACTIVE = "ACTIVE", _("Active & Unlocked")
        CANCELLED = "CANCELLED", _("Cancelled")
        DISPUTED = "DISPUTED", _("Disputed")

    class Outcome(models.TextChoices):
        CONNECTED = "CONNECTED", _("Parties Connected")
        IN_PROGRESS = "IN_PROGRESS", _("Work / Supply in Progress")
        COMPLETED = "COMPLETED", _("Completed Successfully")
        NOT_COMPLETED = "NOT_COMPLETED", _("Not Completed / Cancelled by Parties")
        CANCELLED = "CANCELLED", _("Cancelled")
        DISPUTED = "DISPUTED", _("Disputed / Reported")
        CLOSED = "CLOSED", _("Closed")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.OneToOneField(
        ServiceRequest,
        on_delete=models.CASCADE,
        related_name="connection",
    )
    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name="connections",
    )
    customer_approval_at = models.DateTimeField(auto_now_add=True)
    connection_status = models.CharField(
        _("connection status"),
        max_length=30,
        choices=Status.choices,
        default=Status.PENDING_PAYMENT,
    )
    unlocked_fields = models.JSONField(
        _("unlocked customer details"),
        default=list,
        help_text=_("e.g. ['phone', 'address', 'map_pin']"),
    )
    unlocked_at = models.DateTimeField(_("details unlocked at"), null=True, blank=True)
    outcome = models.CharField(
        _("outcome"),
        max_length=30,
        choices=Outcome.choices,
        null=True,
        blank=True,
    )
    outcome_notes = models.TextField(_("outcome notes"), blank=True)
    outcome_reported_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("connection")
        verbose_name_plural = _("connections")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Connection {self.id} — {self.provider.display_name} ↔ {self.request.customer.email}"
