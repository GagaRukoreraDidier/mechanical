import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings

class AuditEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_events",
    )
    action = models.CharField(_("action performed"), max_length=150)
    object_type = models.CharField(_("object type"), max_length=100)
    object_id = models.CharField(_("object identifier"), max_length=100)
    before_data = models.JSONField(_("state before action"), null=True, blank=True)
    after_data = models.JSONField(_("state after action"), null=True, blank=True)
    ip_address = models.GenericIPAddressField(_("IP address"), null=True, blank=True)
    user_agent = models.TextField(_("user agent"), blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("audit event")
        verbose_name_plural = _("audit events")
        ordering = ["-created_at"]

    def __str__(self):
        actor_name = self.actor.email if self.actor else "System"
        return f"{self.created_at.strftime('%Y-%m-%d %H:%M:%S')} - {actor_name}: {self.action} on {self.object_type}#{self.object_id}"
