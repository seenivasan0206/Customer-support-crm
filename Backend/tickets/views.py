from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Ticket
from .serializers import (
    TicketSerializer,
    TicketCreateSerializer,
    TicketUpdateSerializer
)
from .permissions import IsTicketOwnerOrStaff, CanDeleteTicket

User = get_user_model()


class TicketPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class TicketViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsTicketOwnerOrStaff]
    pagination_class = TicketPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['ticket_id', 'title', 'description', 'customer__username']
    ordering_fields = ['created_at', 'priority', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = Ticket.objects.all().select_related('customer', 'assigned_to')

        if getattr(user, 'role', '') == 'ADMIN' or user.is_staff or user.is_superuser:
            pass
        elif getattr(user, 'role', '') == 'AGENT':
            queryset = queryset.filter(Q(assigned_to=user) | Q(assigned_to__isnull=True))
        else:
            queryset = queryset.filter(customer=user)

        status_param = self.request.query_params.get('status')
        priority_param = self.request.query_params.get('priority')

        if status_param:
            queryset = queryset.filter(status=status_param.upper())
        if priority_param:
            queryset = queryset.filter(priority=priority_param.upper())

        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return TicketCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TicketUpdateSerializer
        return TicketSerializer

    def get_permissions(self):
        if self.action == 'destroy':
            return [IsAuthenticated(), CanDeleteTicket()]
        return super().get_permissions()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def assign(self, request, pk=None):
        if request.user.role not in ['ADMIN', 'AGENT'] and not request.user.is_staff:
            return Response(
                {"error": "Only Admins and Agents can assign tickets"},
                status=status.HTTP_403_FORBIDDEN
            )

        ticket = self.get_object()
        agent_id = request.data.get('agent_id')

        if not agent_id:
            return Response(
                {"error": "agent_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            agent = User.objects.get(id=agent_id, role__in=['AGENT', 'ADMIN'])
            ticket.assigned_to = agent
            if ticket.status == 'OPEN':
                ticket.status = 'PENDING'
            ticket.save()
            return Response(
                {
                    "message": f"Ticket assigned to {agent.username} successfully",
                    "ticket": TicketSerializer(ticket).data
                },
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"error": "Agent with this ID does not exist or is not an agent/admin"},
                status=status.HTTP_404_NOT_FOUND
            )
