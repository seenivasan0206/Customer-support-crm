from django.urls import path
from . import views

urlpatterns = [
    path("", views.agent_list_create, name="agent-list-create"),
    path("search/", views.agent_search, name="agent-search"),
    path("statistics/", views.agent_statistics, name="agent-statistics"),
    path("<int:agent_id>/status/", views.agent_status_update, name="agent-status-update"),
    path("<int:agent_id>/", views.agent_detail, name="agent-detail"),
]
