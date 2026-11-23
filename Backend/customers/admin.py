from django.contrib import admin
from .models import Customer

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("customer_id", "full_name", "email", "subscription_plan", "account_status", "registration_date")
    search_fields = ("full_name", "email", "phone_number")
    list_filter = ("subscription_plan", "account_status")
    readonly_fields = ("customer_id", "registration_date", "updated_at")
