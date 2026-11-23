from django.db import models
from customers.models import Customer
from agents.models import Agent

class Conversation(models.Model):
    STATUS_CHOICES = [("OPEN", "Open"), ("PENDING", "Pending"), ("RESOLVED", "Resolved")]
    PRIORITY_CHOICES = [("LOW", "Low"), ("NORMAL", "Normal"), ("HIGH", "High")]
    conversation_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="conversations")
    assigned_agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True, related_name="conversations")
    subject = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="OPEN")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="NORMAL")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "conversations_conversation"
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Conversation #{self.conversation_id}: {self.subject}"

class Message(models.Model):
    SENDER_CHOICES = [("CUSTOMER", "Customer"), ("AGENT", "Agent"), ("SYSTEM", "System")]
    message_id = models.AutoField(primary_key=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender_type = models.CharField(max_length=20, choices=SENDER_CHOICES)
    sender_agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True, related_name="sent_messages")
    message_text = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "conversations_message"
        ordering = ["sent_at"]

    def __str__(self):
        return f"Message #{self.message_id}"
