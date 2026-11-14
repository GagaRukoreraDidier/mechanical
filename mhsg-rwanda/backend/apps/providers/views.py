from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import (
    ProviderProfile,
    ProviderLocation,
    ProviderCapability,
    ProviderAvailability,
    VerificationDocument,
)
from .serializers import (
    ProviderProfileSerializer,
    ProviderLocationSerializer,
    ProviderCapabilitySerializer,
    ProviderAvailabilitySerializer,
    VerificationDocumentSerializer,
)
from apps.accounts.permissions import IsAdminUserRole

class ProviderProfileViewSet(viewsets.ModelViewSet):
    queryset = ProviderProfile.objects.prefetch_related("locations", "capabilities", "documents").all()
    serializer_class = ProviderProfileSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        if self.action in ["verify", "suspend"]:
            return [IsAdminUserRole()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        try:
            profile = request.user.provider_profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except ProviderProfile.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUserRole])
    def verify(self, request, pk=None):
        profile = self.get_object()
        new_status = request.data.get("verification_status")
        if new_status in ProviderProfile.VerificationStatus.values:
            profile.verification_status = new_status
            profile.save(update_fields=["verification_status", "updated_at"])
            return Response(self.get_serializer(profile).data)
        return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUserRole])
    def suspend(self, request, pk=None):
        profile = self.get_object()
        is_suspended = request.data.get("is_suspended", True)
        reason = request.data.get("reason", "")
        profile.is_suspended = is_suspended
        profile.suspension_reason = reason
        profile.save(update_fields=["is_suspended", "suspension_reason", "updated_at"])
        return Response(self.get_serializer(profile).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def add_location(self, request, pk=None):
        profile = self.get_object()
        if profile.user != request.user and not request.user.is_admin_user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = ProviderLocationSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(provider=profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def add_capability(self, request, pk=None):
        profile = self.get_object()
        if profile.user != request.user and not request.user.is_admin_user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = ProviderCapabilitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(provider=profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def upload_document(self, request, pk=None):
        profile = self.get_object()
        if profile.user != request.user and not request.user.is_admin_user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = VerificationDocumentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(provider=profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
