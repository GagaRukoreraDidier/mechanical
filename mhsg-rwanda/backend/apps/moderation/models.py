import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from apps.connections.models import Connection

class Complaint(models.Model):
    class Status(models.TextChoices):
        OPEN = "OPEN", _("Open / Reported")
        UNDER_REVIEW = "UNDER_REVIEW", _("Under Admin Review")
        RESOLVED = "RESOLVED", _("Resolved")
        CLOSED = "CLOSED", _("Closed without Action")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    connection = models.ForeignKey(
        Connection,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="complaints",
    )
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reported_complaints",
    )
    reason = models.CharField(_("complaint reason"), max_length=150)
    description = models.TextField(_("detailed description"))
    status = models.CharField(
        _("status"),
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
    )
    resolution_notes = models.TextField(_("admin resolution notes"), blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("complaint / report")
        verbose_name_plural = _("complaints & reports")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Complaint by {self.reporter.email}: {self.reason} ({self.status})"
