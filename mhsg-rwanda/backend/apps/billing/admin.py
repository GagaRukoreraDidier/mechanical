from django.contrib import admin
from .models import Payment, FinancialEvent, FeeConfiguration

class FinancialEventInline(admin.TabularInline):
    model = FinancialEvent
    extra = 0
    readonly_fields = ["event_type", "amount_rwf", "before_status", "after_status", "actor", "metadata", "created_at"]

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["internal_reference", "payer", "purpose", "amount_rwf", "payment_provider", "status", "created_at", "succeeded_at"]
    list_filter = ["status", "purpose", "payment_provider"]
    search_fields = ["internal_reference", "external_reference", "payer__email"]
    readonly_fields = ["internal_reference", "created_at", "updated_at", "succeeded_at", "failed_at"]
    inlines = [FinancialEventInline]

@admin.register(FeeConfiguration)
class FeeConfigurationAdmin(admin.ModelAdmin):
    list_display = ["fee_type", "category", "amount_rwf", "effective_from", "effective_to", "is_active"]
    list_filter = ["fee_type", "is_active"]
