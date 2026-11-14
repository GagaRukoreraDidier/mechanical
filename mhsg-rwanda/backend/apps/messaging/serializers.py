from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.full_name", read_only=True)
    sender_email = serializers.EmailField(source="sender.email", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "connection",
            "sender",
            "sender_name",
            "sender_email",
            "recipient",
            "content",
            "sent_at",
            "read_at",
        ]
        read_only_fields = ["id", "sender", "sent_at", "read_at"]
