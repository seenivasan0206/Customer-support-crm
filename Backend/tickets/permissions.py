from rest_framework import permissions


class IsTicketOwnerOrStaff(permissions.BasePermission):
    """
    Object-level permission:
    - Customer can only view/modify their own tickets.
    - Admin and Agent can view/manage all tickets.
    """
    def has_object_permission(self, request, view, obj):
        # Admin or Agent has full access
        if request.user.role in ['ADMIN', 'AGENT'] or request.user.is_staff:
            return True
        # Customer can only access their own ticket
        return obj.customer == request.user


class CanDeleteTicket(permissions.BasePermission):
    """
    Business rules for ticket deletion:
    1. Admin can delete any ticket.
    2. Customer can only delete their own ticket if its status is still 'OPEN'.
    3. Agents cannot delete tickets.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN' or request.user.is_staff:
            return True
        if request.user.role == 'CUSTOMER' and obj.customer == request.user:
            return obj.status == 'OPEN'
        return False
