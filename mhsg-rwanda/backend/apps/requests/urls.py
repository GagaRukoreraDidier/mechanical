from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceRequestViewSet, CustomerAddressViewSet

router = DefaultRouter()
router.register("addresses", CustomerAddressViewSet, basename="customer-address")
router.register("", ServiceRequestViewSet, basename="service-request")

urlpatterns = [
    path("", include(router.urls)),
]
