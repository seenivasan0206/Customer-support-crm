import csv
from django.db.models import Count, Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Customer
from .serializers import CustomerSerializer

def paginated_response(request, queryset, serializer_class):
    paginator = PageNumberPagination()
    paginator.page_size = 10
    paginator.page_size_query_param = "page_size"
    paginator.max_page_size = 100
    page = paginator.paginate_queryset(queryset, request)
    return paginator.get_paginated_response(serializer_class(page, many=True).data)

@api_view(["GET", "POST"])
def customer_list_create(request):
    if request.method == "POST":
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return paginated_response(request, Customer.objects.all(), CustomerSerializer)

@api_view(["GET", "PUT", "PATCH", "DELETE"])
def customer_detail(request, customer_id):
    customer = get_object_or_404(Customer, customer_id=customer_id)
    if request.method == "GET":
        return Response(CustomerSerializer(customer).data)
    if request.method in ["PUT", "PATCH"]:
        serializer = CustomerSerializer(customer, data=request.data, partial=request.method == "PATCH")
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    customer.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["GET"])
def customer_search(request):
    term = request.query_params.get("search", "").strip()
    if not term:
        return Response({"error": "Provide ?search=keyword"}, status=400)
    qs = Customer.objects.filter(
        Q(full_name__icontains=term) | Q(email__icontains=term) | Q(phone_number__icontains=term)
    )
    return paginated_response(request, qs, CustomerSerializer)

@api_view(["GET"])
def customer_filter(request):
    qs = Customer.objects.all()
    plan = request.query_params.get("subscription_plan")
    account_status = request.query_params.get("account_status")
    if plan:
        if plan.upper() not in dict(Customer.PLAN_CHOICES):
            return Response({"error": "Invalid subscription_plan"}, status=400)
        qs = qs.filter(subscription_plan=plan.upper())
    if account_status:
        if account_status.upper() not in dict(Customer.STATUS_CHOICES):
            return Response({"error": "Invalid account_status"}, status=400)
        qs = qs.filter(account_status=account_status.upper())
    return paginated_response(request, qs, CustomerSerializer)

@api_view(["GET"])
def customer_statistics(request):
    qs = Customer.objects
    return Response({
        "total_customers": qs.count(),
        "account_status": {s.lower(): qs.filter(account_status=s).count()
                           for s, _ in Customer.STATUS_CHOICES},
        "subscription_plans": {p.lower(): qs.filter(subscription_plan=p).count()
                               for p, _ in Customer.PLAN_CHOICES},
    })

@api_view(["PATCH"])
def customer_status_update(request, customer_id):
    customer = get_object_or_404(Customer, customer_id=customer_id)
    new_status = str(request.data.get("account_status", "")).upper()
    allowed = dict(Customer.STATUS_CHOICES)
    if new_status not in allowed:
        return Response({"error": "Invalid account_status", "valid_values": list(allowed)}, status=400)
    customer.account_status = new_status
    customer.save(update_fields=["account_status", "updated_at"])
    return Response(CustomerSerializer(customer).data)

@api_view(["GET"])
def customer_sort(request):
    field = request.query_params.get("sort_by", "registration_date")
    order = request.query_params.get("order", "desc").lower()
    allowed = ["full_name", "email", "registration_date"]
    if field not in allowed or order not in ["asc", "desc"]:
        return Response({"error": "Invalid sort_by or order", "allowed_fields": allowed}, status=400)
    return paginated_response(request, Customer.objects.order_by(("-" if order == "desc" else "") + field), CustomerSerializer)

@api_view(["GET"])
def customer_export(request):
    response = HttpResponse(content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = 'attachment; filename="customers.csv"'
    response.write("\ufeff")
    writer = csv.writer(response)
    writer.writerow(["Customer ID", "Full Name", "Email", "Phone Number", "Subscription Plan", "Account Status", "Registration Date"])
    for c in Customer.objects.all():
        writer.writerow([c.customer_id, c.full_name, c.email, c.phone_number or "", c.subscription_plan, c.account_status, c.registration_date.isoformat()])
    return response
