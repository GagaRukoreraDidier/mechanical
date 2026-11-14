import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _

class RwandaProvince(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_("province name"), max_length=100, unique=True)
    code = models.CharField(_("province code"), max_length=10, blank=True)

    class Meta:
        verbose_name = _("province")
        verbose_name_plural = _("provinces")
        ordering = ["name"]

    def __str__(self):
        return self.name


class RwandaDistrict(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    province = models.ForeignKey(RwandaProvince, on_delete=models.CASCADE, related_name="districts")
    name = models.CharField(_("district name"), max_length=100)
    code = models.CharField(_("district code"), max_length=10, blank=True)

    class Meta:
        verbose_name = _("district")
        verbose_name_plural = _("districts")
        ordering = ["province", "name"]
        unique_together = ["province", "name"]

    def __str__(self):
        return f"{self.name} ({self.province.name})"


class RwandaSector(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    district = models.ForeignKey(RwandaDistrict, on_delete=models.CASCADE, related_name="sectors")
    name = models.CharField(_("sector name"), max_length=100)

    class Meta:
        verbose_name = _("sector")
        verbose_name_plural = _("sectors")
        ordering = ["district", "name"]
        unique_together = ["district", "name"]

    def __str__(self):
        return f"{self.name}, {self.district.name}"


class RwandaCell(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sector = models.ForeignKey(RwandaSector, on_delete=models.CASCADE, related_name="cells")
    name = models.CharField(_("cell name"), max_length=100)

    class Meta:
        verbose_name = _("cell")
        verbose_name_plural = _("cells")
        ordering = ["sector", "name"]

    def __str__(self):
        return f"{self.name}, {self.sector.name}"


class RwandaVillage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cell = models.ForeignKey(RwandaCell, on_delete=models.CASCADE, related_name="villages")
    name = models.CharField(_("village / umudugudu name"), max_length=100)

    class Meta:
        verbose_name = _("village")
        verbose_name_plural = _("villages")
        ordering = ["cell", "name"]

    def __str__(self):
        return f"{self.name}, {self.cell.name}"
