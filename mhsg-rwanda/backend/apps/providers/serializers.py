from rest_framework import serializers
from .models import (
    ProviderProfile,
    ProviderLocation,
    ProviderCapability,
    ProviderAvailability,
    VerificationDocument,
)

class ProviderLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderLocation
        fields = [
            "id",
            "province",
            "district",
            "sector",
            "cell",
            "village",
            "street_address",
            "free_text_directions",
            "latitude",
            "longitude",
            "service_radius_km",
            "location_visibility",
            "is_primary",
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get("request")
        # Mask exact address unless viewer is admin or the provider itself or active connection with unlock
        is_owner = request and request.user.is_authenticated and instance.provider.user == request.user
        is_admin = request and request.user.is_authenticated and request.user.is_admin_user
        if not (is_owner or is_admin):
            if instance.location_visibility == ProviderLocation.Visibility.DISTRICT_ONLY:
                ret.pop("street_address", None)
                ret.pop("sector", None)
                ret.pop("cell", None)
                ret.pop("village", None)
                ret.pop("free_text_directions", None)
            elif instance.location_visibility == ProviderLocation.Visibility.APPROXIMATE:
                ret.pop("street_address", None)
                ret.pop("free_text_directions", None)
        return ret


class ProviderCapabilitySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = ProviderCapability
        fields = [
            "id",
            "category",
            "category_name",
            "specialty",
            "vehicle_brands",
            "vehicle_systems",
            "equipment",
            "capacity_notes",
            "evidence",
        ]


class ProviderAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderAvailability
        fields = [
            "id",
            "weekday",
            "specific_date",
            "start_time",
            "end_time",
            "status",
        ]


class VerificationDocumentSerializer(serializers.ModelSerializer):
    reviewed_by_name = serializers.CharField(source="reviewed_by.full_name", read_only=True)

    class Meta:
        model = VerificationDocument
        fields = [
            "id",
            "doc_type",
            "document_file",
            "reviewed_by_name",
            "reviewed_at",
            "result",
            "notes",
            "expiry_date",
            "uploaded_at",
        ]
        read_only_fields = ["id", "reviewed_by_name", "reviewed_at", "result", "uploaded_at"]


class ProviderProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_phone = serializers.CharField(source="user.phone", read_only=True)
    locations = ProviderLocationSerializer(many=True, read_only=True)
    capabilities = ProviderCapabilitySerializer(many=True, read_only=True)

    class Meta:
        model = ProviderProfile
        fields = [
            "id",
            "user",
            "user_email",
            "user_phone",
            "display_name",
            "description",
            "provider_types",
            "verification_status",
            "is_active",
            "is_suspended",
            "rating_average",
            "rating_count",
            "locations",
            "capabilities",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "verification_status",
            "is_suspended",
            "rating_average",
            "rating_count",
            "created_at",
        ]
