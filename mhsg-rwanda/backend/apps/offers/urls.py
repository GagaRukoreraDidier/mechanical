from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProviderOfferViewSet

router = DefaultRouter()
router.register("", ProviderOfferViewSet, basename="offer")

urlpatterns = [
    path("", include(router.urls)),
]
