from django.contrib import admin
from .models import ServiceCategory, ProductListing, ServiceListing

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "category_type", "parent", "is_active", "sort_order"]
    list_filter = ["category_type", "is_active"]
    search_fields = ["name", "description"]
    prepopulated_fields = {"slug": ("name",)}

@admin.register(ProductListing)
class ProductListingAdmin(admin.ModelAdmin):
    list_display = ["name", "seller", "condition", "price_rwf", "stock_status", "is_active"]
    list_filter = ["condition", "stock_status", "is_active"]
    search_fields = ["name", "part_number", "seller__display_name"]

@admin.register(ServiceListing)
class ServiceListingAdmin(admin.ModelAdmin):
    list_display = ["category", "provider", "indicative_price_rwf", "is_active"]
    list_filter = ["category", "is_active"]
    search_fields = ["provider__display_name", "description"]
