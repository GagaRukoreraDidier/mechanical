import uuid
from django.db import models
from django.db.models import Avg
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from apps.connections.models import Connection
from apps.providers.models import ProviderProfile

class Review(models.Model):
    class ModerationStatus(models.TextChoices):
        PENDING = "PENDING", _("Pending Moderation")
        APPROVED = "APPROVED", _("Approved & Public")
        REJECTED = "REJECTED", _("Rejected")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    connection = models.OneToOneField(
        Connection,
        on_delete=models.CASCADE,
        related_name="review",
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="submitted_reviews",
    )
    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    rating = models.IntegerField(
        _("rating (1-5 stars)"),
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    comment = models.TextField(_("review comment"), blank=True)
    moderation_status = models.CharField(
        _("moderation status"),
        max_length=20,
        choices=ModerationStatus.choices,
        default=ModerationStatus.APPROVED,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("review")
        verbose_name_plural = _("reviews")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.rating}★ for {self.provider.display_name} by {self.reviewer.email}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.moderation_status == self.ModerationStatus.APPROVED:
            # Recompute provider average rating
            stats = Review.objects.filter(
                provider=self.provider,
                moderation_status=self.ModerationStatus.APPROVED,
            ).aggregate(avg=Avg("rating"), count=models.Count("id"))
            self.provider.rating_average = round(stats["avg"] or 0, 2)
            self.provider.rating_count = stats["count"] or 0
            self.provider.save(update_fields=["rating_average", "rating_count"])
