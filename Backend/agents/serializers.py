from rest_framework import serializers
from .models import Agent

class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = "__all__"
        read_only_fields = ("agent_id", "joined_at", "updated_at")

    def validate_email(self, value):
        value = value.strip().lower()
        qs = Agent.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This agent email is already registered.")
        return value
