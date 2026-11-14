from django.contrib import admin
from .models import RwandaProvince, RwandaDistrict, RwandaSector, RwandaCell, RwandaVillage

@admin.register(RwandaProvince)
class RwandaProvinceAdmin(admin.ModelAdmin):
    list_display = ["name", "code"]
    search_fields = ["name"]

@admin.register(RwandaDistrict)
class RwandaDistrictAdmin(admin.ModelAdmin):
    list_display = ["name", "province", "code"]
    list_filter = ["province"]
    search_fields = ["name"]

@admin.register(RwandaSector)
class RwandaSectorAdmin(admin.ModelAdmin):
    list_display = ["name", "district"]
    list_filter = ["district__province", "district"]
    search_fields = ["name"]

@admin.register(RwandaCell)
class RwandaCellAdmin(admin.ModelAdmin):
    list_display = ["name", "sector"]
    search_fields = ["name"]

@admin.register(RwandaVillage)
class RwandaVillageAdmin(admin.ModelAdmin):
    list_display = ["name", "cell"]
    search_fields = ["name"]
