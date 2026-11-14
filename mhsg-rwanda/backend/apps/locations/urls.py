from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RwandaProvinceViewSet, RwandaDistrictViewSet, RwandaSectorViewSet

router = DefaultRouter()
router.register("provinces", RwandaProvinceViewSet)
router.register("districts", RwandaDistrictViewSet)
router.register("sectors", RwandaSectorViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
