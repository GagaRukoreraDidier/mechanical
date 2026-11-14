from django.contrib import admin
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["connection", "sender", "recipient", "sent_at", "read_at"]
    search_fields = ["content", "sender__email", "recipient__email"]
