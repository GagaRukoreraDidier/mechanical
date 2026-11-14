from django.contrib import admin
from .models import (
    ServiceRequest,
    CustomerAddress,
    RequestAttachment,
    RequestStatusHistory,
    RequestPublication,
    ProviderInvitation,
)

class RequestAttachmentInline(admin.TabularInline):
    model = RequestAttachment
    extra = 0

class RequestStatusHistoryInline(admin.TabularInline):
    model = RequestStatusHistory
    extra = 0
    readonly_fields = ["previous_status", "new_status", "actor", "reason", "created_at"]

@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ["id", "customer", "category", "urgency", "status", "fee_status", "district", "created_at"]
    list_filter = ["status", "fee_status", "urgency", "category__category_type", "district"]
    search_fields = ["description", "customer__email", "vehicle_make", "part_name"]
    readonly_fields = ["created_at", "updated_at", "submitted_at", "published_at"]
    inlines = [RequestAttachmentInline, RequestStatusHistoryInline]

@admin.register(CustomerAddress)
class CustomerAddressAdmin(admin.ModelAdmin):
    list_display = ["customer", "district", "sector", "street_address", "is_default", "phone_consent", "address_consent"]
    list_filter = ["district", "is_default", "phone_consent", "address_consent"]
    search_fields = ["customer__email", "street_address"]

@admin.register(RequestPublication)
class RequestPublicationAdmin(admin.ModelAdmin):
    list_display = ["request", "published_by", "published_at", "expiry"]

@admin.register(ProviderInvitation)
class ProviderInvitationAdmin(admin.ModelAdmin):
    list_display = ["publication", "provider", "status", "viewed_at", "response_deadline"]
    list_filter = ["status"]
