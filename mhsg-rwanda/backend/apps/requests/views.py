from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import (
    ServiceRequest,
    CustomerAddress,
    RequestAttachment,
    RequestStatusHistory,
    ProviderInvitation,
)
from .serializers import (
    ServiceRequestListSerializer,
    ServiceRequestDetailSerializer,
    ServiceRequestCreateSerializer,
    CustomerAddressSerializer,
    RequestAttachmentSerializer,
    RequestStatusHistorySerializer,
    ProviderInvitationSerializer,
)
from .services import RequestService
from apps.accounts.permissions import IsAdminUserRole

class ServiceRequestViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "category", "urgency", "district", "fee_status"]
    search_fields = ["description", "part_name", "vehicle_make", "vehicle_model"]
    ordering_fields = ["created_at", "submitted_at"]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ServiceRequest.objects.none()

        if user.is_admin_user:
            return ServiceRequest.objects.select_related("customer", "category", "protected_address_ref").all()

        if hasattr(user, "provider_profile"):
            # Providers see published requests that they were invited to, or active connections
            provider = user.provider_profile
            return ServiceRequest.objects.filter(
                Q(publications__invitations__provider=provider) |
                Q(connection__provider=provider)
            ).distinct()

        # Regular customer sees own requests
        return ServiceRequest.objects.filter(customer=user)

    def get_serializer_class(self):
        if self.action == "list":
            return ServiceRequestListSerializer
        if self.action == "create":
            return ServiceRequestCreateSerializer
        return ServiceRequestDetailSerializer

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def submit(self, request, pk=None):
        req_obj = self.get_object()
        if req_obj.customer != request.user:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
        updated = RequestService.submit_request(req_obj, actor=request.user)
        return Response(ServiceRequestDetailSerializer(updated, context={"request": request}).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUserRole])
    def admin_review(self, request, pk=None):
        req_obj = self.get_object()
        decision = request.data.get("decision")  # start_review, needs_info, reject, ready_to_publish
        reason = request.data.get("reason", "")
        updated = RequestService.admin_review_decision(req_obj, decision=decision, admin_user=request.user, reason=reason)
        return Response(ServiceRequestDetailSerializer(updated, context={"request": request}).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUserRole])
    def publish(self, request, pk=None):
        req_obj = self.get_object()
        provider_ids = request.data.get("provider_ids")  # optional specific provider UUIDs
        expiry_hours = int(request.data.get("expiry_hours", 48))
        updated = RequestService.publish_request(
            req_obj,
            admin_user=request.user,
            target_provider_ids=provider_ids,
            expiry_hours=expiry_hours,
        )
        return Response(ServiceRequestDetailSerializer(updated, context={"request": request}).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def customer_approval(self, request, pk=None):
        req_obj = self.get_object()
        approved = request.data.get("approved", True)
        reason = request.data.get("reason", "")
        updated = RequestService.customer_approval(
            req_obj,
            customer_user=request.user,
            approved=approved,
            reason=reason,
        )
        return Response(ServiceRequestDetailSerializer(updated, context={"request": request}).data)

    @action(detail=True, methods=["get", "post"], permission_classes=[permissions.IsAuthenticated])
    def attachments(self, request, pk=None):
        req_obj = self.get_object()
        if request.method == "GET":
            serializer = RequestAttachmentSerializer(req_obj.attachments.all(), many=True)
            return Response(serializer.data)
        
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"detail": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        attachment = RequestAttachment.objects.create(
            request=req_obj,
            attachment_file=file_obj,
            file_type=file_obj.content_type,
            uploaded_by=request.user,
        )
        return Response(RequestAttachmentSerializer(attachment).data, status=status.HTTP_201_CREATED)


class CustomerAddressViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerAddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CustomerAddress.objects.filter(customer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)
