from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import SystemSetting, Role, Permission, RolePermission
from .serializers import (
    SystemSettingSerializer,
    RoleSerializer,
    PermissionSerializer,
    RolePermissionSerializer
)

class SystemSettingViewSet(viewsets.ModelViewSet):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    permission_classes = [AllowAny]

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [AllowAny]

class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [AllowAny]

class RolePermissionViewSet(viewsets.ModelViewSet):
    queryset = RolePermission.objects.select_related(
        'role', 'permission'
    ).all()
    serializer_class = RolePermissionSerializer
    permission_classes = [AllowAny]
