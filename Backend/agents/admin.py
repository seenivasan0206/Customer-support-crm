from django.contrib import admin
from .models import Agent

@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ("agent_id", "full_name", "email", "department", "status", "joined_at")
    search_fields = ("full_name", "email")
    list_filter = ("status", "department")
    readonly_fields = ("agent_id", "joined_at", "updated_at")
