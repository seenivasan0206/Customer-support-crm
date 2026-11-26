from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    SystemSettingViewSet,
    RoleViewSet,
    PermissionViewSet,
    RolePermissionViewSet,
    settings_profile,
    settings_roles,
    settings_integrations,
)

router = DefaultRouter()

router.register('settings', SystemSettingViewSet)
router.register('roles', RoleViewSet)
router.register('permissions', PermissionViewSet)
router.register('role-permissions', RolePermissionViewSet)

urlpatterns = [
    path('profile', settings_profile, name='settings-profile-no-slash'),
    path('profile/', settings_profile, name='settings-profile'),
    path('roles', settings_roles, name='settings-roles-no-slash'),
    path('roles/', settings_roles, name='settings-roles'),
    path('integrations', settings_integrations, name='settings-integrations-no-slash'),
    path('integrations/', settings_integrations, name='settings-integrations'),
    path('', include(router.urls)),
]
