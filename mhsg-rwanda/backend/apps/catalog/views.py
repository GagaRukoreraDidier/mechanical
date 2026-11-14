from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import ServiceCategory, ProductListing, ServiceListing
from .serializers import (
    ServiceCategorySerializer,
    ProductListingSerializer,
    ServiceListingSerializer,
)
from apps.accounts.permissions import IsAdminUserRole

class ServiceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.filter(parent__isnull=True, is_active=True)
    serializer_class = ServiceCategorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["category_type"]
    search_fields = ["name", "description"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [IsAdminUserRole()]


class ProductListingViewSet(viewsets.ModelViewSet):
    queryset = ProductListing.objects.select_related("seller", "category").filter(is_active=True)
    serializer_class = ProductListingSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["seller", "category", "condition", "stock_status"]
    search_fields = ["name", "part_number", "description"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class ServiceListingViewSet(viewsets.ModelViewSet):
    queryset = ServiceListing.objects.select_related("provider", "category").filter(is_active=True)
    serializer_class = ServiceListingSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["provider", "category"]
    search_fields = ["description"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
