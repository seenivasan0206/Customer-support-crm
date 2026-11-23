from rest_framework.test import APITestCase
from rest_framework import status
from customers.models import Customer
from .models import Conversation

class ConversationAPITests(APITestCase):
    def setUp(self):
        self.customer = Customer.objects.create(full_name="Test Customer", email="customer@example.com")

    def test_create_conversation(self):
        response = self.client.post("/api/conversations/", {
            "customer": self.customer.customer_id,
            "subject": "Playback problem",
            "description": "Video will not play",
            "priority": "NORMAL"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Conversation.objects.count(), 1)
