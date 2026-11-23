from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Agent
from .serializers import AgentSerializer

def paginated(request, qs):
    paginator = PageNumberPagination()
    paginator.page_size = 10
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(AgentSerializer(page, many=True).data)

@api_view(["GET", "POST"])
def agent_list_create(request):
    if request.method == "POST":
        serializer = AgentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=400)
    return paginated(request, Agent.objects.all())

@api_view(["GET", "PUT", "PATCH", "DELETE"])
def agent_detail(request, agent_id):
    agent = get_object_or_404(Agent, agent_id=agent_id)
    if request.method == "GET":
        return Response(AgentSerializer(agent).data)
    if request.method in ["PUT", "PATCH"]:
        serializer = AgentSerializer(agent, data=request.data, partial=request.method == "PATCH")
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    agent.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["GET"])
def agent_search(request):
    term = request.query_params.get("search", "").strip()
    if not term:
        return Response({"error": "Provide ?search=keyword"}, status=400)
    qs = Agent.objects.filter(Q(full_name__icontains=term) | Q(email__icontains=term) | Q(phone_number__icontains=term))
    return paginated(request, qs)

@api_view(["GET"])
def agent_statistics(request):
    return Response({
        "total_agents": Agent.objects.count(),
        "availability": {s.lower(): Agent.objects.filter(status=s).count()
                         for s, _ in Agent.STATUS_CHOICES},
    })

@api_view(["PATCH"])
def agent_status_update(request, agent_id):
    agent = get_object_or_404(Agent, agent_id=agent_id)
    new_status = str(request.data.get("status", "")).upper()
    allowed = dict(Agent.STATUS_CHOICES)
    if new_status not in allowed:
        return Response({"error": "Invalid status", "valid_values": list(allowed)}, status=400)
    agent.status = new_status
    agent.save(update_fields=["status", "updated_at"])
    return Response(AgentSerializer(agent).data)
