from rest_framework import serializers
from .models import Payment, FinancialEvent, FeeConfiguration

class PaymentSerializer(serializers.ModelSerializer):
    payer_email = serializers.EmailField(source="payer.email", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "payer",
            "payer_email",
            "purpose",
            "related_object_type",
            "related_object_id",
            "amount_rwf",
            "currency",
            "payment_provider",
            "external_reference",
            "internal_reference",
            "status",
            "created_at",
            "succeeded_at",
        ]
        read_only_fields = [
            "id",
            "payer",
            "payer_email",
            "internal_reference",
            "status",
            "created_at",
            "succeeded_at",
        ]


class FeeConfigurationSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = FeeConfiguration
        fields = [
            "id",
            "category",
            "category_name",
            "fee_type",
            "amount_rwf",
            "currency",
            "effective_from",
            "effective_to",
            "is_active",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
