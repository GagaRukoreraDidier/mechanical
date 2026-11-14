import uuid
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Payment, FeeConfiguration
from .serializers import PaymentSerializer, FeeConfigurationSerializer
from .services import PaymentService
from apps.requests.models import ServiceRequest
from apps.connections.models import Connection
from apps.accounts.permissions import IsSuperAdmin

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Payment.objects.none()
        if user.is_admin_user:
            return Payment.objects.select_related("payer").all()
        return Payment.objects.filter(payer=user)

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def initiate_request_fee(self, request):
        request_id = request.data.get("request_id")
        req_obj = get_object_or_404(ServiceRequest, id=request_id, customer=request.user)
        fee_amount = PaymentService.get_configured_fee(FeeConfiguration.FeeType.REQUEST_FEE, req_obj.category)

        payment = PaymentService.create_payment_intent(
            payer=request.user,
            purpose=Payment.Purpose.REQUEST_FEE,
            related_obj=req_obj,
            amount_rwf=fee_amount,
            provider="SANDBOX",
        )
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def initiate_connection_fee(self, request):
        connection_id = request.data.get("connection_id")
        conn = get_object_or_404(Connection, id=connection_id)
        if conn.provider.user != request.user and not request.user.is_admin_user:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        fee_amount = PaymentService.get_configured_fee(FeeConfiguration.FeeType.CONNECTION_FEE, conn.request.category)
        payment = PaymentService.create_payment_intent(
            payer=request.user,
            purpose=Payment.Purpose.CONNECTION_FEE,
            related_obj=conn,
            amount_rwf=fee_amount,
            provider="SANDBOX",
        )
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def simulate_sandbox_pay(self, request, pk=None):
        """Allows testing in dev/sandbox mode without external provider callbacks."""
        payment = self.get_object()
        if payment.payer != request.user and not request.user.is_admin_user:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        external_ref = f"SANDBOX-TX-{uuid.uuid4().hex[:12].upper()}"
        updated_payment = PaymentService.handle_payment_success(
            payment,
            external_ref=external_ref,
            raw_payload={"simulated": True, "by": str(request.user.email)},
            actor=request.user,
        )
        return Response(PaymentSerializer(updated_payment).data)


class SandboxWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        internal_ref = request.data.get("internal_reference")
        external_ref = request.data.get("external_reference", f"EXT-{uuid.uuid4().hex[:10]}")
        payment_status = request.data.get("status", "SUCCEEDED")

        try:
            payment = Payment.objects.get(internal_reference=internal_ref)
        except Payment.DoesNotExist:
            return Response({"detail": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)

        if payment_status == "SUCCEEDED":
            PaymentService.handle_payment_success(payment, external_ref=external_ref, raw_payload=request.data)

        return Response({"status": "received"})


class FeeConfigurationViewSet(viewsets.ModelViewSet):
    queryset = FeeConfiguration.objects.select_related("category").all()
    serializer_class = FeeConfigurationSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [IsSuperAdmin()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
