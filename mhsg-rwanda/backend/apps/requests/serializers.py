from rest_framework import serializers
from .models import (
    ServiceRequest,
    CustomerAddress,
    RequestAttachment,
    RequestStatusHistory,
    RequestPublication,
    ProviderInvitation,
)
from apps.catalog.serializers import ServiceCategorySerializer

class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = [
            "id",
            "province",
            "district",
            "sector",
            "cell",
            "village",
            "street_address",
            "access_instructions",
            "free_text_directions",
            "latitude",
            "longitude",
            "is_default",
            "phone_consent",
            "address_consent",
        ]


class RequestAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_email = serializers.EmailField(source="uploaded_by.email", read_only=True)

    class Meta:
        model = RequestAttachment
        fields = [
            "id",
            "attachment_file",
            "file_type",
            "uploaded_by_email",
            "scan_status",
            "created_at",
        ]
        read_only_fields = ["id", "uploaded_by_email", "scan_status", "created_at"]


class RequestStatusHistorySerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source="actor.email", read_only=True)

    class Meta:
        model = RequestStatusHistory
        fields = [
            "id",
            "previous_status",
            "new_status",
            "actor_email",
            "reason",
            "created_at",
        ]


class ProviderInvitationSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source="provider.display_name", read_only=True)
    provider_id = serializers.UUIDField(source="provider.id", read_only=True)

    class Meta:
        model = ProviderInvitation
        fields = [
            "id",
            "provider_id",
            "provider_name",
            "status",
            "viewed_at",
            "response_deadline",
            "created_at",
        ]


class ServiceRequestListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    customer_name = serializers.CharField(source="customer.full_name", read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            "id",
            "category",
            "category_name",
            "customer_name",
            "description",
            "urgency",
            "status",
            "fee_status",
            "approximate_location",
            "district",
            "province",
            "vehicle_make",
            "vehicle_model",
            "vehicle_year",
            "part_name",
            "budget_rwf",
            "created_at",
            "submitted_at",
        ]


class ServiceRequestDetailSerializer(serializers.ModelSerializer):
    category_detail = ServiceCategorySerializer(source="category", read_only=True)
    attachments = RequestAttachmentSerializer(many=True, read_only=True)
    status_history = RequestStatusHistorySerializer(many=True, read_only=True)
    customer_phone = serializers.SerializerMethodField()
    customer_address = serializers.SerializerMethodField()

    class Meta:
        model = ServiceRequest
        fields = [
            "id",
            "customer",
            "customer_phone",
            "customer_address",
            "category",
            "category_detail",
            "subcategory",
            "description",
            "urgency",
            "status",
            "fee_status",
            "approximate_location",
            "province",
            "district",
            "sector",
            "vehicle_make",
            "vehicle_model",
            "vehicle_year",
            "vehicle_engine",
            "mileage",
            "part_name",
            "part_number",
            "quantity",
            "condition_preference",
            "is_open_to_alternatives",
            "budget_rwf",
            "property_issue",
            "asset_type",
            "preferred_visit_time",
            "attachments",
            "status_history",
            "created_at",
            "updated_at",
            "submitted_at",
            "published_at",
        ]
        read_only_fields = [
            "id",
            "customer",
            "status",
            "fee_status",
            "created_at",
            "updated_at",
            "submitted_at",
            "published_at",
        ]

    def get_customer_phone(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        # Owner or Admin always sees it
        if obj.customer == request.user or request.user.is_admin_user:
            return str(obj.customer.phone) if obj.customer.phone else None
        
        # Check if user is a provider with an unlocked connection for this request
        if hasattr(request.user, "provider_profile"):
            conn = getattr(obj, "connection", None)
            if conn and conn.provider == request.user.provider_profile:
                if "phone" in (conn.unlocked_fields or []) and conn.connection_status == "ACTIVE":
                    return str(obj.customer.phone) if obj.customer.phone else None
        return None

    def get_customer_address(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated or not obj.protected_address_ref:
            return None
        # Owner or Admin
        if obj.customer == request.user or request.user.is_admin_user:
            return CustomerAddressSerializer(obj.protected_address_ref).data

        # Check unlocked connection
        if hasattr(request.user, "provider_profile"):
            conn = getattr(obj, "connection", None)
            if conn and conn.provider == request.user.provider_profile:
                if "address" in (conn.unlocked_fields or []) and conn.connection_status == "ACTIVE":
                    return CustomerAddressSerializer(obj.protected_address_ref).data
        return None


class ServiceRequestCreateSerializer(serializers.ModelSerializer):
    address_id = serializers.UUIDField(required=False, write_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            "id",
            "category",
            "subcategory",
            "description",
            "urgency",
            "approximate_location",
            "province",
            "district",
            "sector",
            "address_id",
            "vehicle_make",
            "vehicle_model",
            "vehicle_year",
            "vehicle_engine",
            "mileage",
            "part_name",
            "part_number",
            "quantity",
            "condition_preference",
            "is_open_to_alternatives",
            "budget_rwf",
            "property_issue",
            "asset_type",
            "preferred_visit_time",
        ]

    def create(self, validated_data):
        address_id = validated_data.pop("address_id", None)
        request_obj = ServiceRequest.objects.create(
            customer=self.context["request"].user,
            **validated_data
        )
        if address_id:
            try:
                addr = CustomerAddress.objects.get(id=address_id, customer=self.context["request"].user)
                request_obj.protected_address_ref = addr
                request_obj.save(update_fields=["protected_address_ref"])
            except CustomerAddress.DoesNotExist:
                pass
        return request_obj
