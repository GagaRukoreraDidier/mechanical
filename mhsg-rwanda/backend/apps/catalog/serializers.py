from rest_framework import serializers
from .models import ServiceCategory, ProductListing, ServiceListing

class ServiceCategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCategory
        fields = [
            "id",
            "parent",
            "name",
            "slug",
            "category_type",
            "description",
            "icon_name",
            "is_active",
            "required_fields_config",
            "sort_order",
            "children",
        ]

    def get_children(self, obj):
        if obj.children.exists():
            return ServiceCategorySerializer(obj.children.filter(is_active=True), many=True).data
        return []


class ProductListingSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source="seller.display_name", read_only=True)

    class Meta:
        model = ProductListing
        fields = [
            "id",
            "seller",
            "seller_name",
            "category",
            "name",
            "part_number",
            "description",
            "compatible_vehicles",
            "condition",
            "price_rwf",
            "stock_status",
            "warranty_terms",
            "return_terms",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ServiceListingSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source="provider.display_name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = ServiceListing
        fields = [
            "id",
            "provider",
            "provider_name",
            "category",
            "category_name",
            "description",
            "indicative_price_rwf",
            "availability_notes",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
