from rest_framework.test import APITestCase
from rest_framework import status
from .models import Customer

class CustomerAPITests(APITestCase):
    def test_create_customer(self):
        response = self.client.post("/api/customers/", {
            "full_name": "Test User", "email": "test@example.com",
            "phone_number": "9876543210", "subscription_plan": "BASIC",
            "account_status": "ACTIVE"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Customer.objects.count(), 1)
