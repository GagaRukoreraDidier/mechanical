import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from apps.catalog.models import ServiceCategory

try:
    from django.contrib.gis.db import models as gis_models
    from django.contrib.gis.geos import Point
    HAS_GIS = True
except Exception:
    gis_models = None
    Point = None
    HAS_GIS = False

class ProviderProfile(models.Model):
    class VerificationStatus(models.TextChoices):
        UNVERIFIED = "UNVERIFIED", _("Unverified")
        IDENTITY_CHECKED = "IDENTITY_CHECKED", _("Identity Checked")
        BUSINESS_CHECKED = "BUSINESS_CHECKED", _("Business Details Checked")
        DOCS_REVIEWED = "DOCS_REVIEWED", _("Documents Reviewed")
        CERTIFIED = "CERTIFIED", _("Independently Certified")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="provider_profile",
    )
    display_name = models.CharField(_("business or professional name"), max_length=255)
    description = models.TextField(_("business description"), blank=True)
    provider_types = models.JSONField(
        _("provider types"),
        default=list,
        help_text=_("List of types: ['GARAGE', 'MECHANIC', 'SELLER', 'HOME_TECH']"),
    )
    verification_status = models.CharField(
        _("verification status"),
        max_length=30,
        choices=VerificationStatus.choices,
        default=VerificationStatus.UNVERIFIED,
    )
    is_active = models.BooleanField(_("is active"), default=True)
    is_suspended = models.BooleanField(_("is suspended"), default=False)
    suspension_reason = models.TextField(_("suspension reason"), blank=True)
    rating_average = models.DecimalField(
        _("average rating"),
        max_digits=3,
        decimal_places=2,
        default=0.00,
    )
    rating_count = models.PositiveIntegerField(_("rating count"), default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("provider profile")
        verbose_name_plural = _("provider profiles")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.display_name} ({self.get_verification_status_display()})"


class ProviderLocation(models.Model):
    class Visibility(models.TextChoices):
        EXACT = "EXACT", _("Exact (Unlocked Only)")
        APPROXIMATE = "APPROXIMATE", _("Approximate Sector")
        DISTRICT_ONLY = "DISTRICT_ONLY", _("District Only")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name="locations",
    )
    province = models.CharField(_("province"), max_length=100)
    district = models.CharField(_("district"), max_length=100)
    sector = models.CharField(_("sector"), max_length=100, blank=True)
    cell = models.CharField(_("cell"), max_length=100, blank=True)
    village = models.CharField(_("village"), max_length=100, blank=True)
    street_address = models.CharField(_("street address"), max_length=255, blank=True)
    free_text_directions = models.TextField(_("directions / landmarks"), blank=True)
    
    latitude = models.FloatField(_("latitude"), null=True, blank=True)
    longitude = models.FloatField(_("longitude"), null=True, blank=True)
    if HAS_GIS and gis_models:
        point = gis_models.PointField(geography=True, srid=4326, null=True, blank=True)
    else:
        point = models.CharField(_("spatial point"), max_length=100, null=True, blank=True)

    service_radius_km = models.DecimalField(
        _("service radius (km)"),
        max_digits=5,
        decimal_places=2,
        default=10.00,
    )
    location_visibility = models.CharField(
        _("location visibility"),
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.APPROXIMATE,
    )
    is_primary = models.BooleanField(_("primary location"), default=True)

    class Meta:
        verbose_name = _("provider location")
        verbose_name_plural = _("provider locations")

    def save(self, *args, **kwargs):
        if self.latitude is not None and self.longitude is not None:
            if HAS_GIS and Point:
                self.point = Point(self.longitude, self.latitude, srid=4326)
            else:
                self.point = f"{self.longitude},{self.latitude}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.provider.display_name} — {self.district}, {self.province}"


class ProviderCapability(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name="capabilities",
    )
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.CASCADE,
        related_name="provider_capabilities",
    )
    specialty = models.CharField(_("specialty / focus area"), max_length=200, blank=True)
    vehicle_brands = models.JSONField(
        _("supported vehicle brands"),
        default=list,
        blank=True,
        help_text=_("e.g. ['Toyota', 'Nissan', 'Mercedes']"),
    )
    vehicle_systems = models.JSONField(
        _("supported vehicle systems"),
        default=list,
        blank=True,
        help_text=_("e.g. ['Electrical', 'Brakes', 'Transmission']"),
    )
    equipment = models.JSONField(
        _("tools & equipment"),
        default=list,
        blank=True,
        help_text=_("e.g. ['OBD-II Diagnostic Scanner', 'Hydraulic Lift']"),
    )
    capacity_notes = models.TextField(_("capacity notes"), blank=True)
    evidence = models.TextField(_("evidence / certifications description"), blank=True)

    class Meta:
        verbose_name = _("provider capability")
        verbose_name_plural = _("provider capabilities")

    def __str__(self):
        return f"{self.provider.display_name} - {self.category.name} ({self.specialty})"


class ProviderAvailability(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", _("Available")
        BUSY = "BUSY", _("Busy")
        UNAVAILABLE = "UNAVAILABLE", _("Unavailable")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name="availabilities",
    )
    weekday = models.IntegerField(
        _("day of week"),
        choices=[(0, "Monday"), (1, "Tuesday"), (2, "Wednesday"), (3, "Thursday"), (4, "Friday"), (5, "Saturday"), (6, "Sunday")],
        null=True,
        blank=True,
    )
    specific_date = models.DateField(_("specific date override"), null=True, blank=True)
    start_time = models.TimeField(_("start time"), default="08:00:00")
    end_time = models.TimeField(_("end time"), default="18:00:00")
    status = models.CharField(
        _("availability status"),
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
    )

    class Meta:
        verbose_name = _("provider availability")
        verbose_name_plural = _("provider availabilities")


class VerificationDocument(models.Model):
    class DocType(models.TextChoices):
        BUSINESS_REGISTRATION = "BUSINESS_REGISTRATION", _("RDB Business Registration")
        NATIONAL_ID = "NATIONAL_ID", _("National ID / Passport")
        TAX_CERTIFICATE = "TAX_CERTIFICATE", _("RRA Tax Clearance")
        PROFESSIONAL_CERTIFICATE = "PROFESSIONAL_CERTIFICATE", _("Trade / Technical Certificate")
        OTHER = "OTHER", _("Other Supporting Document")

    class Result(models.TextChoices):
        PENDING = "PENDING", _("Pending Review")
        APPROVED = "APPROVED", _("Approved")
        REJECTED = "REJECTED", _("Rejected")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.ForeignKey(
        ProviderProfile,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    doc_type = models.CharField(
        _("document type"),
        max_length=50,
        choices=DocType.choices,
    )
    document_file = models.FileField(_("document file"), upload_to="verification_docs/%Y/%m/")
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_documents",
    )
    reviewed_at = models.DateTimeField(_("reviewed at"), null=True, blank=True)
    result = models.CharField(
        _("review result"),
        max_length=20,
        choices=Result.choices,
        default=Result.PENDING,
    )
    notes = models.TextField(_("review notes"), blank=True)
    expiry_date = models.DateField(_("document expiry date"), null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("verification document")
        verbose_name_plural = _("verification documents")
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.provider.display_name} - {self.get_doc_type_display()} ({self.result})"
