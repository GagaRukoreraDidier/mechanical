import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _

class ServiceCategory(models.Model):
    class CategoryType(models.TextChoices):
        AUTOMOTIVE_SERVICE = "AUTOMOTIVE_SERVICE", _("Automotive Service")
        SPARE_PARTS = "SPARE_PARTS", _("Spare Parts")
        HOME_SERVICE = "HOME_SERVICE", _("Home Service")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )
    name = models.CharField(_("name"), max_length=200)
    slug = models.SlugField(_("slug"), max_length=200, unique=True, blank=True)
    category_type = models.CharField(
        _("category type"),
        max_length=50,
        choices=CategoryType.choices,
        default=CategoryType.AUTOMOTIVE_SERVICE,
    )
    description = models.TextField(_("description"), blank=True)
    icon_name = models.CharField(_("icon name"), max_length=100, blank=True, help_text=_("Lucide icon identifier"))
    is_active = models.BooleanField(_("is active"), default=True)
    required_fields_config = models.JSONField(
        _("required fields configuration"),
        default=dict,
        blank=True,
        help_text=_("Configures required inputs for requests under this category"),
    )
    sort_order = models.IntegerField(_("sort order"), default=0)

    class Meta:
        verbose_name = _("service category")
        verbose_name_plural = _("service categories")
        ordering = ["sort_order", "name"]

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} → {self.name}"
        return f"{self.name} ({self.get_category_type_display()})"


class ProductListing(models.Model):
    class Condition(models.TextChoices):
        NEW = "NEW", _("Brand New")
        GENUINE = "GENUINE", _("Genuine (Evidence Required)")
        OEM = "OEM", _("OEM")
        AFTERMARKET = "AFTERMARKET", _("Aftermarket")
        REFURBISHED = "REFURBISHED", _("Refurbished")
        USED = "USED", _("Used")

    class StockStatus(models.TextChoices):
        IN_STOCK = "IN_STOCK", _("In Stock")
        OUT_OF_STOCK = "OUT_OF_STOCK", _("Out of Stock")
        ON_ORDER = "ON_ORDER", _("Available on Order")
        UNKNOWN = "UNKNOWN", _("Unknown")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seller = models.ForeignKey(
        "providers.ProviderProfile",
        on_delete=models.CASCADE,
        related_name="products",
    )
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    name = models.CharField(_("part name"), max_length=255)
    part_number = models.CharField(_("part number / OEM"), max_length=100, blank=True)
    description = models.TextField(_("description"), blank=True)
    compatible_vehicles = models.JSONField(
        _("compatible vehicles"),
        default=list,
        blank=True,
        help_text=_("List of objects: [{'make': 'Toyota', 'model': 'RAV4', 'years': [2010, 2015]}]"),
    )
    condition = models.CharField(
        _("condition"),
        max_length=30,
        choices=Condition.choices,
        default=Condition.NEW,
    )
    price_rwf = models.BigIntegerField(_("price (RWF)"))
    stock_status = models.CharField(
        _("stock status"),
        max_length=30,
        choices=StockStatus.choices,
        default=StockStatus.IN_STOCK,
    )
    warranty_terms = models.TextField(_("warranty terms"), blank=True)
    return_terms = models.TextField(_("return terms"), blank=True)
    is_active = models.BooleanField(_("is active"), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("product listing")
        verbose_name_plural = _("product listings")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - RWF {self.price_rwf:,} ({self.seller.display_name})"


class ServiceListing(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.ForeignKey(
        "providers.ProviderProfile",
        on_delete=models.CASCADE,
        related_name="services",
    )
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.CASCADE,
        related_name="provider_services",
    )
    description = models.TextField(_("description"), blank=True)
    indicative_price_rwf = models.BigIntegerField(_("indicative price (RWF)"), null=True, blank=True)
    availability_notes = models.TextField(_("availability notes"), blank=True)
    is_active = models.BooleanField(_("is active"), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("service listing")
        verbose_name_plural = _("service listings")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.category.name} ({self.provider.display_name})"
