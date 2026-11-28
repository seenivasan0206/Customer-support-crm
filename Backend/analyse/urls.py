from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, report_options, report_summary, report_save

router = DefaultRouter()
router.register('reports', ReportViewSet)

urlpatterns = [
    path('options/', report_options, name='report-options'),
    path('summary/', report_summary, name='report-summary'),
    path('saved/', report_save, name='report-saved'),
    path('schedules/', report_save, name='report-schedules'),
    path('', include(router.urls)),
]
