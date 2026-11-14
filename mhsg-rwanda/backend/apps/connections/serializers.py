from rest_framework import serializers
from .models import Connection
from apps.requests.serializers import ServiceRequestListSerializer, CustomerAddressSerializer
from apps.providers.serializers import ProviderProfileSerializer

class ConnectionSerializer(serializers.ModelSerializer):
    request_detail = ServiceRequestListSerializer(source="request", read_only=True)
    provider_detail = ProviderProfileSerializer(source="provider", read_only=True)
    customer_phone = serializers.SerializerMethodField()
    customer_address = serializers.SerializerMethodField()

    class Meta:
        model = Connection
        fields = [
            "id",
            "request",
            "request_detail",
            "provider",
            "provider_detail",
            "customer_approval_at",
            "connection_status",
            "unlocked_fields",
            "unlocked_at",
            "outcome",
            "outcome_notes",
            "outcome_reported_at",
            "customer_phone",
            "customer_address",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "request",
            "provider",
            "customer_approval_at",
            "connection_status",
            "unlocked_fields",
            "unlocked_at",
            "created_at",
        ]

    def get_customer_phone(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        # Must be either Admin or the approved Provider with 'phone' unlocked
        is_admin = request.user.is_admin_user
        is_provider = (
            hasattr(request.user, "provider_profile")
            and obj.provider == request.user.provider_profile
            and obj.connection_status == Connection.Status.ACTIVE
            and "phone" in (obj.unlocked_fields or [])
        )
        is_customer = obj.request.customer == request.user
        if is_admin or is_provider or is_customer:
            return str(obj.request.customer.phone) if obj.request.customer.phone else None
        return None

    def get_customer_address(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated or not obj.request.protected_address_ref:
            return None
        is_admin = request.user.is_admin_user
        is_provider = (
            hasattr(request.user, "provider_profile")
            and obj.provider == request.user.provider_profile
            and obj.connection_status == Connection.Status.ACTIVE
            and "address" in (obj.unlocked_fields or [])
        )
        is_customer = obj.request.customer == request.user
        if is_admin or is_provider or is_customer:
            return CustomerAddressSerializer(obj.request.protected_address_ref).data
        return None
