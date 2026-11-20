from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from .models import Category, Article
from .serializers import CategorySerializer, ArticleSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.select_related(
        'category', 'author'
    ).all()

    serializer_class = ArticleSerializer
    permission_classes = [AllowAny]

    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content', 'summary']

