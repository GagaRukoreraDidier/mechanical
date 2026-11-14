import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from apps.catalog.models import ServiceCategory
from apps.providers.models import ProviderProfile

try:
    from django.contrib.gis.db import models as gis_models
    from django.contrib.gis.geos import Point
    HAS_GIS = True
except Exception:
    gis_models = None
    Point = None
    HAS_GIS = False

class CustomerAddress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="addresses",
    )
    province = models.CharField(_("province"), max_length=100)
    district = models.CharField(_("district"), max_length=100)
    sector = models.CharField(_("sector"), max_length=100)
    cell = models.CharField(_("cell"), max_length=100, blank=True)
    village = models.CharField(_("village"), max_length=100, blank=True)
    street_address = models.CharField(_("street address / house number"), max_length=255)
    access_instructions = models.TextField(_("gate / access instructions"), blank=True)
    free_text_directions = models.TextField(_("landmarks & directions"), blank=True)
    
    latitude = models.FloatField(_("latitude"), null=True, blank=True)
    longitude = models.FloatField(_("longitude"), null=True, blank=True)
    if HAS_GIS and gis_models:
        point = gis_models.PointField(geography=True, srid=4326, null=True, blank=True)
    else:
        point = models.CharField(_("spatial point"), max_length=100, null=True, blank=True)

    is_default = models.BooleanField(_("default address"), default=False)
    phone_consent = models.BooleanField(_("consent to share phone"), default=False)
    address_consent = models.BooleanField(_("consent to share exact address"), default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("customer address")
        verbose_name_plural = _("customer addresses")

    def save(self, *args, **kwargs):
        if self.latitude is not None and self.longitude is not None:
            if HAS_GIS and Point:
                self.point = Point(self.longitude, self.latitude, srid=4326)
            else:
                self.point = f"{self.longitude},{self.latitude}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.customer.email} - {self.district}, {self.province}"


class ServiceRequest(models.Model):
    class Urgency(models.TextChoices):
        STANDARD = "STANDARD", _("Standard (Within 24-48 hrs)")
        URGENT = "URGENT", _("Urgent (Today)")
        EMERGENCY = "EMERGENCY", _("Emergency / Breakdown (Immediate)")

    class Status(models.TextChoices):
        DRAFT = "DRAFT", _("Draft")
        AWAITING_REQUEST_PAYMENT = "AWAITING_REQUEST_PAYMENT", _("Awaiting Activation Fee")
        SUBMITTED = "SUBMITTED", _("Submitted")
        NEEDS_INFORMATION = "NEEDS_INFORMATION", _("Needs Information")
        UNDER_REVIEW = "UNDER_REVIEW", _("Under Review")
        REJECTED = "REJECTED", _("Rejected")
        READY_TO_PUBLISH = "READY_TO_PUBLISH", _("Ready to Publish")
        PUBLISHED = "PUBLISHED", _("Published to Providers")
        OFFERS_RECEIVED = "OFFERS_RECEIVED", _("Offers Received")
        AWAITING_CUSTOMER_APPROVAL = "AWAITING_CUSTOMER_APPROVAL", _("Awaiting Customer Approval")
        CUSTOMER_APPROVED = "CUSTOMER_APPROVED", _("Customer Approved")
        AWAITING_CONNECTION_PAYMENT = "AWAITING_CONNECTION_PAYMENT", _("Awaiting Connection Payment")
        CONNECTION_UNLOCKED = "CONNECTION_UNLOCKED", _("Connection Unlocked")
        CONNECTED = "CONNECTED", _("Connected")
        IN_PROGRESS_OR_ARRANGED = "IN_PROGRESS_OR_ARRANGED", _("Work or Supply Arranged")
        COMPLETED = "COMPLETED", _("Completed")
        CANCELLED = "CANCELLED", _("Cancelled")
        CLOSED = "CLOSED", _("Closed")
        REPORTED = "REPORTED", _("Reported / Disputed")

    class FeeStatus(models.TextChoices):
        PENDING = "PENDING", _("Pending Payment")
        SUCCEEDED = "SUCCEEDED", _("Paid & Verified")
        FAILED = "FAILED", _("Payment Failed")
        WAIVED = "WAIVED", _("Waived by Admin")
        REFUNDED = "REFUNDED", _("Refunded")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="service_requests",
    )
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.PROTECT,
        related_name="requests",
    )
    subcategory = models.ForeignKey(
        ServiceCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sub_requests",
    )
    description = models.TextField(_("detailed description / symptoms"))
    urgency = models.CharField(
        _("urgency"),
        max_length=20,
        choices=Urgency.choices,
        default=Urgency.STANDARD,
    )
    status = models.CharField(
        _("status"),
        max_length=40,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    fee_status = models.CharField(
        _("activation fee status"),
        max_length=20,
        choices=FeeStatus.choices,
        default=FeeStatus.PENDING,
    )

    # Approximate location shown to providers before unlock
    approximate_location = models.CharField(_("approximate location"), max_length=255)
    province = models.CharField(_("province"), max_length=100)
    district = models.CharField(_("district"), max_length=100)
    sector = models.CharField(_("sector"), max_length=100, blank=True)

    # Protected exact address reference — never exposed before connection unlocked
    protected_address_ref = models.ForeignKey(
        CustomerAddress,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="associated_requests",
        help_text=_("Protected exact address, unlocked only upon verified connection payment"),
    )

    # Automotive specifics
    vehicle_make = models.CharField(_("vehicle make"), max_length=100, blank=True)
    vehicle_model = models.CharField(_("vehicle model"), max_length=100, blank=True)
    vehicle_year = models.CharField(_("vehicle year"), max_length=10, blank=True)
    vehicle_engine = models.CharField(_("vehicle engine / trim"), max_length=100, blank=True)
    mileage = models.CharField(_("approximate mileage"), max_length=50, blank=True)

    # Spare parts specifics
    part_name = models.CharField(_("spare part name"), max_length=255, blank=True)
    part_number = models.CharField(_("part number / OEM"), max_length=100, blank=True)
    quantity = models.PositiveIntegerField(_("quantity"), default=1)
    condition_preference = models.CharField(_("condition preference"), max_length=50, blank=True)
    is_open_to_alternatives = models.BooleanField(_("open to compatible alternatives"), default=True)
    budget_rwf = models.BigIntegerField(_("customer budget (RWF)"), null=True, blank=True)

    # Home service specifics
    property_issue = models.CharField(_("property issue"), max_length=255, blank=True)
    asset_type = models.CharField(_("asset / appliance type"), max_length=100, blank=True)
    preferred_visit_time = models.CharField(_("preferred visit time"), max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("service request")
        verbose_name_plural = _("service requests")
        ordering = ["-created_at"]

    def __str__(self):
        return f"REQ-{str(self.id)[:8].upper()} — {self.category.name} ({self.get_status_display()})"


class RequestAttachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(
        ServiceRequest,
        on_delete=models.CASCADE,
        related_name="attachments",
    )
    attachment_file = models.FileField(_("attachment file"), upload_to="request_files/%Y/%m/")
    file_type = models.CharField(_("file type"), max_length=50, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="uploaded_request_attachments",
    )
    scan_status = models.CharField(_("virus scan status"), max_length=20, default="CLEAN")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("request attachment")
        verbose_name_plural = _("request attachments")


class RequestStatusHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(
        ServiceRequest,
        on_delete=models.CASCADE,
        related_name="status_history",
    )
    previous_status = models.CharField(max_length=40)
    new_status = models.CharField(max_length=40)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="status_changes_made",
    )
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("request status history")
        verbose_name_plural = _("request status histories")
        ordering = ["-created_at"]


class RequestPublication(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(
        ServiceRequest,
        on_delete=models.CASCADE,
        related_name="publications",
    )
    target_provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="targeted_publications",
        help_text=_("Null if broadcast to pool"),
    )
    target_group_filter = models.JSONField(
        _("target group filters applied"),
        default=dict,
        blank=True,
    )
    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="published_requests",
    )
    published_at = models.DateTimeField(auto_now_add=True)
    expiry = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("request publication")
        verbose_name_plural = _("request publications")


class ProviderInvitation(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", _("Pending")
        VIEWED = "VIEWED", _("Viewed")
        ACCEPTED = "ACCEPTED", _("Accepted & Quoted")
        DECLINED = "DECLINED", _("Declined")
        EXPIRED = "EXPIRED", _("Expired")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    publication = models.ForeignKey(
        RequestPublication,
        on_delete=models.CASCADE,
        related_name="invitations",
    )
    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name="invitations",
    )
    status = models.CharField(
        _("status"),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    viewed_at = models.DateTimeField(null=True, blank=True)
    response_deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("provider invitation")
        verbose_name_plural = _("provider invitations")
        unique_together = ["publication", "provider"]
