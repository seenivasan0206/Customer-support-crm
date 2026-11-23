from rest_framework.test import APITestCase
from rest_framework import status
from .models import Agent

class AgentAPITests(APITestCase):
    def test_create_agent(self):
        response = self.client.post("/api/agents/", {
            "full_name": "Support Agent", "email": "agent@example.com",
            "phone_number": "9876543210", "department": "Support",
            "status": "AVAILABLE"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Agent.objects.count(), 1)
