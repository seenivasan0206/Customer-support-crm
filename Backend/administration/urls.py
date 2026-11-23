from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    SystemSettingViewSet,
    RoleViewSet,
    PermissionViewSet,
    RolePermissionViewSet
)

router = DefaultRouter()

router.register('settings', SystemSettingViewSet)
router.register('roles', RoleViewSet)
router.register('permissions', PermissionViewSet)
router.register('role-permissions', RolePermissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
