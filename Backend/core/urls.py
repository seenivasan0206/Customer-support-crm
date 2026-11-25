from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/knowledge/', include('knowledge.urls')),
    path('api/analyse/', include('analyse.urls')),
    path('api/reports/', include('analyse.urls')),
    path('api/administration/', include('administration.urls')),
    path('api/settings/', include('administration.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/tickets/', include('tickets.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/customers/', include('customers.urls')),
    path('api/agents/', include('agents.urls')),
    path('api/conversations/', include('conversations.urls')),
]
