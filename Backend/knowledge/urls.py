
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ArticleViewSet

router = DefaultRouter()

router.register('categories', CategoryViewSet)
router.register('articles', ArticleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
