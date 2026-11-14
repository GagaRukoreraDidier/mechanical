from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubscriptionPlanViewSet, ProviderSubscriptionViewSet

router = DefaultRouter()
router.register("plans", SubscriptionPlanViewSet, basename="subscription-plan")
router.register("provider-subs", ProviderSubscriptionViewSet, basename="provider-subscription")

urlpatterns = [
    path("", include(router.urls)),
]
