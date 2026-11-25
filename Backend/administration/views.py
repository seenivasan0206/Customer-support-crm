from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model

from .models import SystemSetting, Role, Permission, RolePermission
from .serializers import (
    SystemSettingSerializer,
    RoleSerializer,
    PermissionSerializer,
    RolePermissionSerializer
)

User = get_user_model()

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


@api_view(["GET", "PUT"])
@permission_classes([AllowAny])
def settings_profile(request):
    user = request.user if request.user.is_authenticated else User.objects.filter(role="ADMIN").first()
    if not user:
        user = User.objects.first()

    if request.method == "PUT":
        data = request.data
        if user:
            if "name" in data and data["name"]:
                user.username = data["name"].strip()
            if "email" in data and data["email"]:
                user.email = data["email"].strip()
            if "phone" in data:
                user.phone = data["phone"].strip()
            user.save()

        # Save extra settings
        for key in ["linkedin", "website", "language", "currency"]:
            if key in data:
                SystemSetting.objects.update_or_create(
                    key=f"user_profile_{key}",
                    defaults={"value": str(data[key])}
                )

        return Response({
            "name": user.username if user else data.get("name", ""),
            "email": user.email if user else data.get("email", ""),
            "phone": user.phone if user else data.get("phone", ""),
            "linkedin": data.get("linkedin", ""),
            "website": data.get("website", ""),
            "language": data.get("language", "English"),
            "currency": data.get("currency", "USD"),
            "role": user.role if user else "ADMIN",
        })

    # GET
    def get_setting(key, default=""):
        s = SystemSetting.objects.filter(key=f"user_profile_{key}").first()
        return s.value if s else default

    return Response({
        "name": user.username if user else "Admin",
        "email": user.email if user else "admin@gmail.com",
        "phone": getattr(user, "phone", "") or "+1 234 567 890",
        "linkedin": get_setting("linkedin", "https://linkedin.com/company/supportcrm"),
        "website": get_setting("website", "https://supportcrm.local"),
        "language": get_setting("language", "English"),
        "currency": get_setting("currency", "USD"),
        "role": getattr(user, "role", "ADMIN"),
        "photoUrl": "",
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def settings_roles(request):
    roles = Role.objects.all()
    return Response({
        "currentRole": "Admin",
        "roles": [r.name for r in roles] if roles else ["Admin", "Support Agent", "Team Leader"]
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def settings_integrations(request):
    return Response([
        {"id": 1, "name": "Email Notification Service", "status": "Connected"},
        {"id": 2, "name": "Live Chat WebSocket Gateway", "status": "Connected"},
        {"id": 3, "name": "MySQL Production Database", "status": "Active"},
    ])
