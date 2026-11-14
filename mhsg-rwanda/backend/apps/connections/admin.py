from django.contrib import admin
from .models import Connection

@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ["id", "request", "provider", "connection_status", "unlocked_at", "outcome", "created_at"]
    list_filter = ["connection_status", "outcome"]
    search_fields = ["request__id", "provider__display_name", "request__customer__email"]
    readonly_fields = ["customer_approval_at", "unlocked_at", "created_at", "updated_at"]
