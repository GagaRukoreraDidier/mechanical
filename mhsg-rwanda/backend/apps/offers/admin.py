from django.contrib import admin
from .models import ProviderOffer, ProviderSelection

@admin.register(ProviderOffer)
class ProviderOfferAdmin(admin.ModelAdmin):
    list_display = ["request", "provider", "price_min_rwf", "price_max_rwf", "status", "submitted_at"]
    list_filter = ["status"]
    search_fields = ["provider__display_name", "request__id", "scope"]

@admin.register(ProviderSelection)
class ProviderSelectionAdmin(admin.ModelAdmin):
    list_display = ["request", "selected_offer", "admin", "customer_decision", "admin_selected_at"]
    list_filter = ["customer_decision"]
