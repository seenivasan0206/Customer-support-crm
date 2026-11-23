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


# Pagination (10 tickets per page by default)
class TicketPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class TicketViewSet(viewsets.ModelViewSet):
    """
    Support Ticket CRUD operations:
    - Create: POST /api/tickets/
    - List: GET /api/tickets/ (Search, Filter, Pagination)
    - Detail: GET /api/tickets/<pk>/
    - Update: PUT/PATCH /api/tickets/<pk>/
    - Delete: DELETE /api/tickets/<pk>/
    - Assign: POST /api/tickets/<pk>/assign/
    """
    permission_classes = [IsAuthenticated, IsTicketOwnerOrStaff]
    pagination_class = TicketPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['ticket_id', 'title', 'description', 'customer__username']
    ordering_fields = ['created_at', 'priority', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = Ticket.objects.all().select_related('customer', 'assigned_to')

        # 1. Role-based Visibility Scoping
        if user.role == 'ADMIN' or user.is_staff:
            pass  # Admin can view all tickets
        elif user.role == 'AGENT':
            # Agent can view assigned tickets or unassigned tickets
            queryset = queryset.filter(Q(assigned_to=user) | Q(assigned_to__isnull=True))
        else:
            # Customer can only view their own tickets
            queryset = queryset.filter(customer=user)

        # 2. Query Parameter Filtering (by status & priority)
        status_param = self.request.query_params.get('status')
        priority_param = self.request.query_params.get('priority')

        if status_param:
            queryset = queryset.filter(status=status_param.upper())
        if priority_param:
            queryset = queryset.filter(priority=priority_param.upper())

        return queryset

    def get_serializer_class(self):
        # Select serializer based on current action
        if self.action == 'create':
            return TicketCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TicketUpdateSerializer
        return TicketSerializer

    def get_permissions(self):
        # Apply strict business rules for delete operations
        if self.action == 'destroy':
            return [IsAuthenticated(), CanDeleteTicket()]
        return super().get_permissions()

    # Ticket Assignment API
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def assign(self, request, pk=None):
        """
        POST /api/tickets/<pk>/assign/
        Body: {"agent_id": 2}
        """
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
                ticket.status = 'PENDING'  # Advance status to PENDING upon assignment
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
