import uuid
from django.urls import reverse
from rest_framework import status
from ..models import Customer
from ..serializers import CustomerSerializer
from .utils import JWTTestCase
from copy import deepcopy


class CustomerAPITest(JWTTestCase):
    @classmethod
    def setUpTestData(cls):
        data = {
            "user": {
                "username": "newuser_persist",
                "password": "newpassword",
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@example.com",
            },
            "mailing_address": "123 Main St, New York, NY 10001",
        }
        customer = CustomerSerializer(data=data)
        customer.is_valid()
        customer.save()

        cls.customer = Customer.objects.get(user__username="newuser_persist")

    def test_create_customer(self):
        url = reverse("customer_create")
        data = {
            "user": {
                "username": "newuser",
                "password": "newpassword",
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@example.com",
            },
            "mailing_address": "123 Main St, New York, NY 10001",
        }

        response = self.post(url, data=data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Customer.objects.count(), 4)
        customer = Customer.objects.first()
        self.assertEqual(customer.user.first_name, data["user"]["first_name"])
        self.assertEqual(customer.user.last_name, data["user"]["last_name"])
        self.assertEqual(customer.user.email, data["user"]["email"])
        self.assertEqual(customer.mailing_address, data["mailing_address"])

    def test_get_all_customers_unauthorized(self):
        url = reverse("customers")
        response = self.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_all_customers_authorized(self):
        url = reverse("customers")
        response = self.get(url, staff=True)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        customers = Customer.objects.all()
        serializer = CustomerSerializer(customers, many=True)
        self.assertEqual(response.data.get("results"), serializer.data)

    def test_get_customer_by_username(self):
        url = reverse("customer_lookup")
        response = self.get(url, {"username": self.customer.user.username})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"].get("username"), self.customer.user.username)
        self.assertEqual(response.data["user"].get("first_name"), self.customer.user.first_name)
        self.assertEqual(response.data["user"].get("last_name"), self.customer.user.last_name)
        self.assertEqual(response.data["user"].get("email"), self.customer.user.email)
        self.assertEqual(response.data["mailing_address"], self.customer.mailing_address)

    def test_get_customer_by_invalid_username(self):
        url = reverse("customer_lookup")
        response = self.get(url, {"username": "invalid_username"})

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_customer_by_id(self):
        url = reverse("customer_detail", kwargs={"id": self.customer.id})
        response = self.get(url, staff=True)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"].get("username"), self.customer.user.username)
        self.assertEqual(response.data["user"].get("first_name"), self.customer.user.first_name)
        self.assertEqual(response.data["user"].get("last_name"), self.customer.user.last_name)
        self.assertEqual(response.data["user"].get("email"), self.customer.user.email)
        self.assertEqual(response.data["mailing_address"], self.customer.mailing_address)

    def test_get_customer_by_invalid_id(self):
        url = reverse("customer_detail", kwargs={"id": uuid.uuid4()})
        response = self.get(url, staff=True)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_customer(self):
        url = reverse("customer_detail", kwargs={"id": self.customer.id})
        data = {
            "user": {
                "first_name": "Updated First Name",
                "last_name": "Updated Last Name",
                "email": "updated@example.com",
            }
        }

        response = self.patch(url, data=data, staff=True)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        customer = Customer.objects.get(pk=self.customer.id)
        self.assertEqual(customer.user.first_name, data["user"]["first_name"])
        self.assertEqual(customer.user.last_name, data["user"]["last_name"])
        self.assertEqual(customer.user.email, data["user"]["email"])

    def test_delete_customer(self):
        url = reverse("customer_detail", kwargs={"id": self.customer.id})

        response = self.delete(url, staff=True)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Customer.objects.filter(pk=self.customer.id).exists(), False)

    def test_delete_invalid_customer(self):
        url = reverse("customer_detail", kwargs={"id": uuid.uuid4()})

        response = self.delete(url, staff=True)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
