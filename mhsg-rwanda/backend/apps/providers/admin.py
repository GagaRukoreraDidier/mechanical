from django.contrib import admin
from .models import (
    ProviderProfile,
    ProviderLocation,
    ProviderCapability,
    ProviderAvailability,
    VerificationDocument,
)

class ProviderLocationInline(admin.TabularInline):
    model = ProviderLocation
    extra = 1

class ProviderCapabilityInline(admin.TabularInline):
    model = ProviderCapability
    extra = 1

class VerificationDocumentInline(admin.TabularInline):
    model = VerificationDocument
    extra = 0

@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    list_display = ["display_name", "user", "verification_status", "is_active", "is_suspended", "rating_average", "created_at"]
    list_filter = ["verification_status", "is_active", "is_suspended"]
    search_fields = ["display_name", "user__email", "user__phone"]
    inlines = [ProviderLocationInline, ProviderCapabilityInline, VerificationDocumentInline]

@admin.register(VerificationDocument)
class VerificationDocumentAdmin(admin.ModelAdmin):
    list_display = ["provider", "doc_type", "result", "reviewed_by", "reviewed_at", "expiry_date"]
    list_filter = ["result", "doc_type"]
    search_fields = ["provider__display_name", "notes"]
