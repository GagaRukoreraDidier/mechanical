from django.contrib import admin
from .models import SubscriptionPlan, ProviderSubscription, ConnectionCreditLedger

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ["name", "price_rwf", "billing_period", "included_connections", "is_active"]
    list_filter = ["billing_period", "is_active"]

@admin.register(ProviderSubscription)
class ProviderSubscriptionAdmin(admin.ModelAdmin):
    list_display = ["provider", "plan", "status", "start_date", "end_date", "included_credits_used"]
    list_filter = ["status"]

@admin.register(ConnectionCreditLedger)
class ConnectionCreditLedgerAdmin(admin.ModelAdmin):
    list_display = ["provider", "amount", "reason", "created_at"]
