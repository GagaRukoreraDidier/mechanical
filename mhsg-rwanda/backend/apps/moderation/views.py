from rest_framework import serializers, viewsets, permissions, status
from .models import Complaint
from apps.accounts.permissions import IsAdminUserRole

class ComplaintSerializer(serializers.ModelSerializer):
    reporter_email = serializers.EmailField(source="reporter.email", read_only=True)

    class Meta:
        model = Complaint
        fields = [
            "id",
            "connection",
            "reporter",
            "reporter_email",
            "reason",
            "description",
            "status",
            "resolution_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "reporter", "reporter_email", "status", "resolution_notes", "created_at", "updated_at"]


class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Complaint.objects.none()
        if user.is_admin_user:
            return Complaint.objects.select_related("reporter", "connection").all()
        return Complaint.objects.filter(reporter=user)

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
