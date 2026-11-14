from rest_framework import serializers
from .models import ProviderOffer, ProviderSelection
from apps.providers.serializers import ProviderProfileSerializer

class ProviderOfferSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source="provider.display_name", read_only=True)
    provider_verification = serializers.CharField(source="provider.verification_status", read_only=True)
    provider_rating = serializers.DecimalField(source="provider.rating_average", max_digits=3, decimal_places=2, read_only=True)

    class Meta:
        model = ProviderOffer
        fields = [
            "id",
            "request",
            "provider",
            "provider_name",
            "provider_verification",
            "provider_rating",
            "price_min_rwf",
            "price_max_rwf",
            "currency",
            "scope",
            "availability",
            "estimated_lead_time",
            "stock_status",
            "item_condition",
            "warranty_terms",
            "limitations",
            "status",
            "is_genuine_confirmed",
            "submitted_at",
            "revised_at",
        ]
        read_only_fields = ["id", "provider", "submitted_at", "revised_at"]


class ProviderSelectionSerializer(serializers.ModelSerializer):
    offer_detail = ProviderOfferSerializer(source="selected_offer", read_only=True)
    admin_name = serializers.CharField(source="admin.full_name", read_only=True)

    class Meta:
        model = ProviderSelection
        fields = [
            "id",
            "request",
            "selected_offer",
            "offer_detail",
            "admin",
            "admin_name",
            "rationale",
            "customer_decision",
            "admin_selected_at",
            "customer_decided_at",
        ]
        read_only_fields = ["id", "admin", "admin_selected_at", "customer_decided_at"]
