from django.contrib import admin
from .models import Conversation, Message

class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ("sent_at",)

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("conversation_id", "subject", "customer", "assigned_agent", "status", "priority", "created_at")
    list_filter = ("status", "priority")
    search_fields = ("subject", "customer__full_name", "customer__email")
    inlines = [MessageInline]

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("message_id", "conversation", "sender_type", "sender_agent", "sent_at")
    list_filter = ("sender_type",)
