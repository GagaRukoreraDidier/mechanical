from django.contrib import admin
from .models import AuditEvent

@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ["created_at", "actor", "action", "object_type", "object_id", "ip_address"]
    list_filter = ["action", "object_type"]
    search_fields = ["object_id", "actor__email", "action"]
    readonly_fields = [
        "id",
        "actor",
        "action",
        "object_type",
        "object_id",
        "before_data",
        "after_data",
        "ip_address",
        "user_agent",
        "created_at",
    ]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
