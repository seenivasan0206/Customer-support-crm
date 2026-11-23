from django.db import models

class Customer(models.Model):
    PLAN_CHOICES = [
        ("FREE", "Free"), ("BASIC", "Basic"),
        ("STANDARD", "Standard"), ("PREMIUM", "Premium"),
    ]
    STATUS_CHOICES = [
        ("ACTIVE", "Active"), ("INACTIVE", "Inactive"),
        ("SUSPENDED", "Suspended"),
    ]
    customer_id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    subscription_plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default="FREE")
    account_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ACTIVE")
    registration_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "customers_customer"
        ordering = ["-registration_date"]

    def __str__(self):
        return f"{self.full_name} ({self.email})"
