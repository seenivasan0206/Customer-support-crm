from rest_framework import serializers
from .models import Conversation, Message
from customers.models import Customer
from agents.models import Agent

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = ("message_id", "sent_at")

class ConversationSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.full_name", read_only=True)
    assigned_agent_name = serializers.CharField(source="assigned_agent.full_name", read_only=True)
    class Meta:
        model = Conversation
        fields = [
            "conversation_id", "customer", "customer_name", "assigned_agent",
            "assigned_agent_name", "subject", "description", "status",
            "priority", "created_at", "updated_at", "resolved_at"
        ]
        read_only_fields = ("conversation_id", "created_at", "updated_at", "resolved_at")

    def validate_customer(self, customer):
        if customer.account_status == "SUSPENDED":
            raise serializers.ValidationError("Cannot open a conversation for a suspended customer.")
        return customer

class MessageCreateSerializer(serializers.Serializer):
    sender_type = serializers.ChoiceField(choices=["CUSTOMER", "AGENT"])
    message_text = serializers.CharField()
    sender_agent = serializers.PrimaryKeyRelatedField(
        queryset=Agent.objects.all(), required=False, allow_null=True
    )

    def validate(self, attrs):
        if attrs["sender_type"] == "CUSTOMER" and attrs.get("sender_agent"):
            attrs["sender_agent"] = None
        return attrs
