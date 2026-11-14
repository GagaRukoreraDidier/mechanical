from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["provider", "rating", "reviewer", "moderation_status", "created_at"]
    list_filter = ["moderation_status", "rating"]
    search_fields = ["provider__display_name", "reviewer__email", "comment"]
