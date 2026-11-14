from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceCategoryViewSet,
    ProductListingViewSet,
    ServiceListingViewSet,
)

router = DefaultRouter()
router.register("categories", ServiceCategoryViewSet, basename="category")
router.register("products", ProductListingViewSet, basename="product")
router.register("services", ServiceListingViewSet, basename="service")

urlpatterns = [
    path("", include(router.urls)),
]
