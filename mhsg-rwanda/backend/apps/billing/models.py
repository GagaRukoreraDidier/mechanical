import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from apps.catalog.models import ServiceCategory

class Payment(models.Model):
    class Purpose(models.TextChoices):
        REQUEST_FEE = "REQUEST_FEE", _("Request Activation Fee")
        PROVIDER_SUBSCRIPTION = "PROVIDER_SUBSCRIPTION", _("Provider Monthly Subscription")
        CONNECTION_FEE = "CONNECTION_FEE", _("Provider Connection Fee")
        REFUND = "REFUND", _("Refund to Customer/Provider")
        ADMIN_CREDIT = "ADMIN_CREDIT", _("Admin Operational Credit")

    class Status(models.TextChoices):
        CREATED = "CREATED", _("Created / Pending Checkout")
        PENDING = "PENDING", _("Awaiting Payment Provider Confirmation")
        SUCCEEDED = "SUCCEEDED", _("Payment Succeeded & Verified")
        FAILED = "FAILED", _("Payment Failed")
        EXPIRED = "EXPIRED", _("Payment Expired")
        REFUND_PENDING = "REFUND_PENDING", _("Refund Pending")
        REFUNDED = "REFUNDED", _("Refunded")
        PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED", _("Partially Refunded")

    class Provider(models.TextChoices):
        SANDBOX = "SANDBOX", _("Sandbox / Test Provider")
        MTN_MOMO = "MTN_MOMO", _("MTN Mobile Money Rwanda")
        AIRTEL_MONEY = "AIRTEL_MONEY", _("Airtel Money Rwanda")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    purpose = models.CharField(
        _("payment purpose"),
        max_length=30,
        choices=Purpose.choices,
    )
    related_object_type = models.CharField(
        _("related object type"),
        max_length=50,
        help_text=_("e.g. 'service_request', 'connection', 'provider_subscription'"),
    )
    related_object_id = models.UUIDField(_("related object UUID"))
    amount_rwf = models.BigIntegerField(_("amount (RWF)"))
    currency = models.CharField(_("currency"), max_length=3, default="RWF")
    payment_provider = models.CharField(
        _("payment provider"),
        max_length=30,
        choices=Provider.choices,
        default=Provider.SANDBOX,
    )
    external_reference = models.CharField(
        _("provider transaction reference"),
        max_length=150,
        unique=True,
        null=True,
        blank=True,
    )
    internal_reference = models.UUIDField(
        _("internal reference"),
        unique=True,
        default=uuid.uuid4,
    )
    status = models.CharField(
        _("payment status"),
        max_length=30,
        choices=Status.choices,
        default=Status.CREATED,
    )
    idempotency_key = models.CharField(
        _("idempotency key"),
        max_length=150,
        unique=True,
    )
    provider_response = models.JSONField(
        _("raw provider payload"),
        default=dict,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    succeeded_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("payment")
        verbose_name_plural = _("payments")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_purpose_display()} - RWF {self.amount_rwf:,} ({self.status}) [{self.payer.email}]"


class FinancialEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name="events",
    )
    event_type = models.CharField(max_length=100)
    amount_rwf = models.BigIntegerField()
    before_status = models.CharField(max_length=30)
    after_status = models.CharField(max_length=30)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("financial event")
        verbose_name_plural = _("financial events")
        ordering = ["-created_at"]


class FeeConfiguration(models.Model):
    class FeeType(models.TextChoices):
        REQUEST_FEE = "REQUEST_FEE", _("Customer Request Activation Fee")
        CONNECTION_FEE = "CONNECTION_FEE", _("Provider Connection Fee")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="fee_configurations",
        help_text=_("Leave null for system-wide fallback fee"),
    )
    fee_type = models.CharField(
        _("fee type"),
        max_length=30,
        choices=FeeType.choices,
    )
    amount_rwf = models.BigIntegerField(_("fee amount (RWF)"))
    currency = models.CharField(max_length=3, default="RWF")
    effective_from = models.DateField(_("effective from"))
    effective_to = models.DateField(_("effective to"), null=True, blank=True)
    is_active = models.BooleanField(_("is active"), default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_fees",
    )
    notes = models.TextField(_("notes / rationale"), blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("fee configuration")
        verbose_name_plural = _("fee configurations")
        ordering = ["-effective_from"]

    def __str__(self):
        cat = self.category.name if self.category else "Default / Global"
        return f"{self.get_fee_type_display()} ({cat}) = RWF {self.amount_rwf:,}"
