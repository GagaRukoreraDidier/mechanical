from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import SubscriptionPlan, ProviderSubscription, ConnectionCreditLedger
from .serializers import (
    SubscriptionPlanSerializer,
    ProviderSubscriptionSerializer,
    ConnectionCreditLedgerSerializer,
)
from apps.accounts.permissions import IsSuperAdmin

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [IsSuperAdmin()]


class ProviderSubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProviderSubscriptionSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ProviderSubscription.objects.none()
        if user.is_admin_user:
            return ProviderSubscription.objects.select_related("provider", "plan").all()
        if hasattr(user, "provider_profile"):
            return ProviderSubscription.objects.filter(provider=user.provider_profile)
        return ProviderSubscription.objects.none()

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_subscription(self, request):
        if not hasattr(request.user, "provider_profile"):
            return Response({"detail": "Not a provider."}, status=status.HTTP_400_BAD_REQUEST)
        sub = ProviderSubscription.objects.filter(
            provider=request.user.provider_profile,
            status=ProviderSubscription.Status.ACTIVE,
        ).first()
        if not sub:
            return Response(None)
        return Response(self.get_serializer(sub).data)
