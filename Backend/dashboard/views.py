from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q

from tickets.models import Ticket
from tickets.serializers import TicketSerializer


class DashboardOverviewView(APIView):
    """
    Dashboard Overview API:
    Calculates real-time ticket statistics from MySQL database
    using optimized Django ORM database aggregations.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = Ticket.objects.all()

        # 1. Role-based Scoping
        if user.role == 'ADMIN' or user.is_staff:
            pass  # Admin views complete CRM system statistics
        elif user.role == 'AGENT':
            # Agent views statistics for assigned and unassigned tickets
            queryset = queryset.filter(Q(assigned_to=user) | Q(assigned_to__isnull=True))
        else:
            # Customer views statistics for their own tickets
            queryset = queryset.filter(customer=user)

        # 2. Database Aggregation (Calculated in a single SQL query)
        stats = queryset.aggregate(
            total_tickets=Count('id'),
            open_tickets=Count('id', filter=Q(status='OPEN')),
            pending_tickets=Count('id', filter=Q(status='PENDING')),
            resolved_tickets=Count('id', filter=Q(status='RESOLVED')),
            closed_tickets=Count('id', filter=Q(status='CLOSED')),
            low_priority=Count('id', filter=Q(priority='LOW')),
            medium_priority=Count('id', filter=Q(priority='MEDIUM')),
            high_priority=Count('id', filter=Q(priority='HIGH')),
            urgent_priority=Count('id', filter=Q(priority='URGENT')),
        )

        # 3. Recent Support Requests (Latest 5 tickets)
        recent_tickets = queryset.select_related('customer', 'assigned_to').order_by('-created_at')[:5]
        recent_serialized = TicketSerializer(recent_tickets, many=True).data

        # 4. Formatted Response Payload for Frontend React Dashboard
        data = {
            "summary": {
                "total_tickets": stats['total_tickets'] or 0,
                "open_tickets": stats['open_tickets'] or 0,
                "pending_tickets": stats['pending_tickets'] or 0,
                "resolved_tickets": stats['resolved_tickets'] or 0,
                "closed_tickets": stats['closed_tickets'] or 0,
            },
            "priority_statistics": {
                "low": stats['low_priority'] or 0,
                "medium": stats['medium_priority'] or 0,
                "high": stats['high_priority'] or 0,
                "urgent": stats['urgent_priority'] or 0,
            },
            "recent_requests": recent_serialized
        }

        return Response(data, status=status.HTTP_200_OK)
