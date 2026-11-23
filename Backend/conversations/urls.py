from django.urls import path
from . import views

urlpatterns = [
    path("", views.conversation_list_create, name="conversation-list-create"),
    path("search/", views.conversation_search, name="conversation-search"),
    path("filter/", views.conversation_filter, name="conversation-filter"),
    path("<int:conversation_id>/", views.conversation_detail, name="conversation-detail"),
    path("<int:conversation_id>/messages/", views.send_message, name="send-message"),
    path("<int:conversation_id>/history/", views.conversation_history, name="conversation-history"),
    path("<int:conversation_id>/assign/", views.assign_agent, name="assign-agent"),
    path("<int:conversation_id>/status/", views.update_conversation_status, name="conversation-status"),
]
