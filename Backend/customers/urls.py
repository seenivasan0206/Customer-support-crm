from django.urls import path
from . import views

urlpatterns = [
    path("", views.customer_list_create, name="customer-list-create"),
    path("search/", views.customer_search, name="customer-search"),
    path("filter/", views.customer_filter, name="customer-filter"),
    path("statistics/", views.customer_statistics, name="customer-statistics"),
    path("sort/", views.customer_sort, name="customer-sort"),
    path("export/", views.customer_export, name="customer-export"),
    path("<int:customer_id>/status/", views.customer_status_update, name="customer-status-update"),
    path("<int:customer_id>/", views.customer_detail, name="customer-detail"),
]
