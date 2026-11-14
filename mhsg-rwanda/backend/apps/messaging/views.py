from rest_framework import viewsets, permissions, status
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer
from apps.connections.models import Connection

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["connection"]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).select_related("sender", "recipient")

    def perform_create(self, serializer):
        user = self.request.user
        conn = serializer.validated_data["connection"]
        # Determine recipient
        if conn.request.customer == user:
            recipient = conn.provider.user
        else:
            recipient = conn.request.customer

        serializer.save(sender=user, recipient=recipient)
