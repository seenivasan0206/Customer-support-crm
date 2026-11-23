from django.db import models

class Agent(models.Model):
    STATUS_CHOICES = [("AVAILABLE", "Available"), ("BUSY", "Busy"), ("INACTIVE", "Inactive")]
    agent_id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True)
    department = models.CharField(max_length=100, default="Customer Support")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="AVAILABLE")
    joined_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "agents_agent"
        ordering = ["full_name"]

    def __str__(self):
        return self.full_name
