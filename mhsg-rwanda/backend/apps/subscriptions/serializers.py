from rest_framework import serializers
from .models import SubscriptionPlan, ProviderSubscription, ConnectionCreditLedger

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "name",
            "description",
            "price_rwf",
            "billing_period",
            "included_connections",
            "discounted_connection_fee_rwf",
            "features",
            "is_active",
        ]


class ProviderSubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="plan.name", read_only=True)
    plan_details = SubscriptionPlanSerializer(source="plan", read_only=True)
    credits_remaining = serializers.SerializerMethodField()

    class Meta:
        model = ProviderSubscription
        fields = [
            "id",
            "provider",
            "plan",
            "plan_name",
            "plan_details",
            "start_date",
            "end_date",
            "status",
            "included_credits_used",
            "credits_remaining",
            "created_at",
        ]
        read_only_fields = ["id", "provider", "status", "included_credits_used", "created_at"]

    def get_credits_remaining(self, obj):
        total = obj.plan.included_connections
        used = obj.included_credits_used
        return max(0, total - used)


class ConnectionCreditLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConnectionCreditLedger
        fields = [
            "id",
            "amount",
            "reason",
            "created_at",
        ]
