import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.providers.models import ProviderProfile
from apps.connections.models import Connection

class SubscriptionPlan(models.Model):
    class BillingPeriod(models.TextChoices):
        MONTHLY = "MONTHLY", _("Monthly")
        ANNUAL = "ANNUAL", _("Annual")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_("plan name"), max_length=100)
    description = models.TextField(_("plan description"), blank=True)
    price_rwf = models.BigIntegerField(_("subscription fee (RWF)"))
    billing_period = models.CharField(
        _("billing period"),
        max_length=20,
        choices=BillingPeriod.choices,
        default=BillingPeriod.MONTHLY,
    )
    included_connections = models.PositiveIntegerField(
        _("monthly included connections"),
        default=0,
        help_text=_("Number of connection fees waived/included per billing cycle"),
    )
    discounted_connection_fee_rwf = models.BigIntegerField(
        _("discounted overage connection fee (RWF)"),
        default=1500,
    )
    features = models.JSONField(
        _("features list"),
        default=list,
        blank=True,
    )
    is_active = models.BooleanField(_("is active"), default=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        verbose_name = _("subscription plan")
        verbose_name_plural = _("subscription plans")
        ordering = ["sort_order", "price_rwf"]

    def __str__(self):
        return f"{self.name} — RWF {self.price_rwf:,}/{self.billing_period.lower()}"


class ProviderSubscription(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", _("Active")
        EXPIRED = "EXPIRED", _("Expired")
        CANCELLED = "CANCELLED", _("Cancelled")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name="subscriptions",
    )
    start_date = models.DateField(_("start date"))
    end_date = models.DateField(_("end date"))
    status = models.CharField(
        _("status"),
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    included_credits_used = models.PositiveIntegerField(_("included credits used"), default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("provider subscription")
        verbose_name_plural = _("provider subscriptions")
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.provider.display_name} - {self.plan.name} ({self.status})"


class ConnectionCreditLedger(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name="credit_ledger_entries",
    )
    connection = models.ForeignKey(
        Connection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="credit_deductions",
    )
    amount = models.IntegerField(_("credit change (+/-)"), help_text=_("Positive for credits granted, negative for used"))
    reason = models.CharField(_("transaction reason"), max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("connection credit ledger entry")
        verbose_name_plural = _("connection credit ledger entries")
        ordering = ["-created_at"]
