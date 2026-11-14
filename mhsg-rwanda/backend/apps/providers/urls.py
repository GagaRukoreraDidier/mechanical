from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProviderProfileViewSet

router = DefaultRouter()
router.register("", ProviderProfileViewSet, basename="provider")

urlpatterns = [
    path("", include(router.urls)),
]
