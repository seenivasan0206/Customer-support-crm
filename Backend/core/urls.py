
"""
URL configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Existing modules
    path('api/knowledge/', include('knowledge.urls')),
    path('api/analyse/', include('analyse.urls')),
    path('api/administration/', include('administration.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/tickets/', include('tickets.urls')),
    path('api/dashboard/', include('dashboard.urls')),

    # Customer Management
    path('api/customers/', include('customers.urls')),

    # Agent Management
    path('api/agents/', include('agents.urls')),

    # Conversations & Live Chat
    path('api/conversations/', include('conversations.urls')),
]
