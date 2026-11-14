from django.contrib import admin
from .models import Complaint

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ["reason", "reporter", "status", "created_at"]
    list_filter = ["status"]
    search_fields = ["reason", "description", "reporter__email"]
