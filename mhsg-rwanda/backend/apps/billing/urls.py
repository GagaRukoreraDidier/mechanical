from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, FeeConfigurationViewSet, SandboxWebhookView

router = DefaultRouter()
router.register("payments", PaymentViewSet, basename="payment")
router.register("fee-configs", FeeConfigurationViewSet, basename="fee-config")

urlpatterns = [
    path("webhook/sandbox/", SandboxWebhookView.as_view(), name="sandbox-webhook"),
    path("", include(router.urls)),
]
