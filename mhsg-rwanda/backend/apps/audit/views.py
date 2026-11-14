from rest_framework import serializers, viewsets, permissions
from .models import AuditEvent
from apps.accounts.permissions import IsSuperAdmin

class AuditEventSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source="actor.email", read_only=True)

    class Meta:
        model = AuditEvent
        fields = [
            "id",
            "actor_email",
            "action",
            "object_type",
            "object_id",
            "before_data",
            "after_data",
            "ip_address",
            "created_at",
        ]


class AuditEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditEvent.objects.select_related("actor").all()
    serializer_class = AuditEventSerializer
    permission_classes = [IsSuperAdmin]
    filterset_fields = ["action", "object_type", "object_id"]
