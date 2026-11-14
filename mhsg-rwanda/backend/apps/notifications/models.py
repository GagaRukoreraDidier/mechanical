import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings

class Notification(models.Model):
    class Channel(models.TextChoices):
        EMAIL = "EMAIL", _("Email")
        SMS = "SMS", _("SMS")
        IN_APP = "IN_APP", _("In-App Notification")

    class Status(models.TextChoices):
        PENDING = "PENDING", _("Pending Delivery")
        SENT = "SENT", _("Delivered")
        FAILED = "FAILED", _("Delivery Failed")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    channel = models.CharField(
        _("delivery channel"),
        max_length=20,
        choices=Channel.choices,
        default=Channel.IN_APP,
    )
    template_name = models.CharField(_("notification type / template"), max_length=100)
    title = models.CharField(_("notification title"), max_length=255, default="Notification")
    message = models.TextField(_("notification text"))
    payload = models.JSONField(_("metadata"), default=dict, blank=True)
    status = models.CharField(
        _("delivery status"),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    is_read = models.BooleanField(_("marked as read"), default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("notification")
        verbose_name_plural = _("notifications")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient.email} - {self.template_name} ({self.status})"
