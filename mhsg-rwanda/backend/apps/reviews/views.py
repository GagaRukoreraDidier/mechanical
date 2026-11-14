from rest_framework import serializers, viewsets, permissions, status
from .models import Review
from apps.connections.models import Connection

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source="reviewer.full_name", read_only=True)
    provider_name = serializers.CharField(source="provider.display_name", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "connection",
            "reviewer_name",
            "provider",
            "provider_name",
            "rating",
            "comment",
            "created_at",
        ]
        read_only_fields = ["id", "reviewer_name", "provider", "provider_name", "created_at"]


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    filterset_fields = ["provider", "rating"]

    def get_queryset(self):
        return Review.objects.filter(
            moderation_status=Review.ModerationStatus.APPROVED
        ).select_related("reviewer", "provider")

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        user = self.request.user
        conn = serializer.validated_data["connection"]
        if conn.request.customer != user:
            raise serializers.ValidationError("Only the customer of this completed connection can leave a review.")
        serializer.save(reviewer=user, provider=conn.provider)
