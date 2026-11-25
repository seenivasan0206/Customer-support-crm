from rest_framework import permissions


class IsTicketOwnerOrStaff(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if getattr(request.user, 'role', '') in ['ADMIN', 'AGENT'] or request.user.is_staff or request.user.is_superuser:
            return True
        return obj.customer == request.user


class CanDeleteTicket(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if getattr(request.user, 'role', '') == 'ADMIN' or request.user.is_staff or request.user.is_superuser:
            return True
        if getattr(request.user, 'role', '') == 'CUSTOMER' and obj.customer == request.user:
            return obj.status == 'OPEN'
        return False
