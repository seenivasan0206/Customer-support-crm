from rest_framework import serializers
from .models import Ticket
from accounts.serializers import UserSerializer


# 1. Full Ticket Representation (List & Detail views with nested user info)
class TicketSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = (
            'id',
            'ticket_id',
            'title',
            'description',
            'customer',
            'assigned_to',
            'status',
            'priority',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'ticket_id', 'created_at', 'updated_at')


# 2. Ticket Creation Serializer (Customer creates ticket with title, description, priority)
class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ('id', 'ticket_id', 'title', 'description', 'priority')
        read_only_fields = ('id', 'ticket_id')

    def create(self, validated_data):
        # Automatically associate logged-in user as ticket customer
        user = self.context['request'].user
        return Ticket.objects.create(customer=user, **validated_data)


# 3. Ticket Update Serializer (Used for updating status, priority, or assigned agent)
class TicketUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ('status', 'priority', 'assigned_to')
