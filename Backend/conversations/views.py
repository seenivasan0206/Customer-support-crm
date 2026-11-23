from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, MessageCreateSerializer

def paginated(request, qs, serializer_class=ConversationSerializer):
    paginator = PageNumberPagination()
    paginator.page_size = 10
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(serializer_class(page, many=True).data)

@api_view(["GET", "POST"])
def conversation_list_create(request):
    if request.method == "POST":
        serializer = ConversationSerializer(data=request.data)
        if serializer.is_valid():
            conversation = serializer.save()
            return Response(ConversationSerializer(conversation).data, status=201)
        return Response(serializer.errors, status=400)
    return paginated(request, Conversation.objects.select_related("customer", "assigned_agent").all())

@api_view(["GET", "PATCH", "DELETE"])
def conversation_detail(request, conversation_id):
    conversation = get_object_or_404(
        Conversation.objects.select_related("customer", "assigned_agent"), conversation_id=conversation_id
    )
    if request.method == "GET":
        return Response(ConversationSerializer(conversation).data)
    if request.method == "PATCH":
        serializer = ConversationSerializer(conversation, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            if updated.status == "RESOLVED" and not updated.resolved_at:
                updated.resolved_at = timezone.now()
                updated.save(update_fields=["resolved_at"])
            elif updated.status != "RESOLVED" and updated.resolved_at:
                updated.resolved_at = None
                updated.save(update_fields=["resolved_at"])
            return Response(ConversationSerializer(updated).data)
        return Response(serializer.errors, status=400)
    conversation.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["GET"])
def conversation_search(request):
    term = request.query_params.get("search", "").strip()
    if not term:
        return Response({"error": "Provide ?search=keyword"}, status=400)
    qs = Conversation.objects.filter(
        Q(subject__icontains=term) | Q(description__icontains=term) |
        Q(customer__full_name__icontains=term) | Q(customer__email__icontains=term)
    ).select_related("customer", "assigned_agent")
    return paginated(request, qs)

@api_view(["GET"])
def conversation_filter(request):
    qs = Conversation.objects.all().select_related("customer", "assigned_agent")
    conv_status = request.query_params.get("status")
    priority = request.query_params.get("priority")
    agent_id = request.query_params.get("assigned_agent")
    customer_id = request.query_params.get("customer")
    if conv_status:
        if conv_status.upper() not in dict(Conversation.STATUS_CHOICES):
            return Response({"error": "Invalid status"}, status=400)
        qs = qs.filter(status=conv_status.upper())
    if priority:
        if priority.upper() not in dict(Conversation.PRIORITY_CHOICES):
            return Response({"error": "Invalid priority"}, status=400)
        qs = qs.filter(priority=priority.upper())
    if agent_id:
        qs = qs.filter(assigned_agent_id=agent_id)
    if customer_id:
        qs = qs.filter(customer_id=customer_id)
    return paginated(request, qs)

@api_view(["POST"])
def send_message(request, conversation_id):
    conversation = get_object_or_404(Conversation, conversation_id=conversation_id)
    if conversation.status == "RESOLVED":
        return Response({"error": "Cannot add messages to a resolved conversation."}, status=400)
    serializer = MessageCreateSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        message = Message.objects.create(
            conversation=conversation,
            sender_type=data["sender_type"],
            sender_agent=data.get("sender_agent"),
            message_text=data["message_text"].strip(),
        )
        conversation.save(update_fields=["updated_at"])
        return Response(MessageSerializer(message).data, status=201)
    return Response(serializer.errors, status=400)

@api_view(["GET"])
def conversation_history(request, conversation_id):
    conversation = get_object_or_404(Conversation, conversation_id=conversation_id)
    messages = conversation.messages.select_related("sender_agent").all()
    paginator = PageNumberPagination()
    paginator.page_size = 50
    page = paginator.paginate_queryset(messages, request)
    return paginator.get_paginated_response(MessageSerializer(page, many=True).data)

@api_view(["PATCH"])
def assign_agent(request, conversation_id):
    conversation = get_object_or_404(Conversation, conversation_id=conversation_id)
    agent_id = request.data.get("agent_id")
    if agent_id in [None, ""]:
        conversation.assigned_agent = None
    else:
        from agents.models import Agent
        agent = get_object_or_404(Agent, agent_id=agent_id)
        if agent.status == "INACTIVE":
            return Response({"error": "Cannot assign an inactive agent."}, status=400)
        conversation.assigned_agent = agent
        if agent.status == "AVAILABLE":
            agent.status = "BUSY"
            agent.save(update_fields=["status", "updated_at"])
    conversation.save()
    return Response(ConversationSerializer(conversation).data)

@api_view(["PATCH"])
def update_conversation_status(request, conversation_id):
    conversation = get_object_or_404(Conversation, conversation_id=conversation_id)
    new_status = str(request.data.get("status", "")).upper()
    if new_status not in dict(Conversation.STATUS_CHOICES):
        return Response({"error": "Invalid status", "valid_values": list(dict(Conversation.STATUS_CHOICES))}, status=400)
    conversation.status = new_status
    conversation.resolved_at = timezone.now() if new_status == "RESOLVED" else None
    conversation.save()
    return Response(ConversationSerializer(conversation).data)
