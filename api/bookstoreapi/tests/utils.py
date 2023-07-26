from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from ..models import Customer
from ..serializers import CustomerSerializer

User = get_user_model()


def createCustomer(
    username, password, first_name="John", last_name="Doe", email="jdoe@example.com", mailing_address="123 Main St."
):
    serializer = CustomerSerializer(
        data={
            "user": {
                "username": username,
                "password": password,
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
            },
            "mailing_address": mailing_address,
        }
    )
    serializer.is_valid()
    serializer.save()
    return Customer.objects.get(user__username=username)


class JWTTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.client = APIClient()
        cls.staff_client = APIClient()
        cls.user = createCustomer(username="testuser", password="testpassword").user
        cls.staff_user = createCustomer(username="testuser_staff", password="testpassword").user
        cls.staff_user.is_staff = True
        cls.staff_user.save()

        # Get the JWT token for the user using rest_framework_simplejwt library
        response = cls.client.post(
            reverse("token_obtain_pair"), {"username": "testuser", "password": "testpassword"}, format="json"
        )
        cls.token = response.data.get("access")

        response = cls.client.post(
            reverse("token_obtain_pair"), {"username": "testuser_staff", "password": "testpassword"}, format="json"
        )
        cls.staff_token = response.data.get("access")

        # Set the appropriate headers on the client
        cls.client.credentials(HTTP_AUTHORIZATION=f"Bearer {cls.token}", HTTP_CONTENT_TYPE="application/json")
        cls.staff_client.credentials(HTTP_AUTHORIZATION=f"Bearer {cls.staff_token}", HTTP_CONTENT_TYPE="application/json")

    @classmethod
    def tearDownClass(cls):
        # Clean up after all tests in this TestCase subclass
        cls.user.delete()
        cls.staff_user.delete()
        super().tearDownClass()

    # Custom methods that override the client methods with format='json'
    @classmethod
    def _json_request(cls, method, url, *args, **kwargs):
        kwargs["format"] = "json"
        return method(url, *args, **kwargs)

    @classmethod
    def get(cls, url, *args, **kwargs):
        if kwargs.get("staff", False):
            return cls._json_request(cls.staff_client.get, url, *args, **kwargs)
        else:
            return cls._json_request(cls.client.get, url, *args, **kwargs)

    @classmethod
    def post(cls, url, *args, **kwargs):
        if kwargs.get("staff", False):
            return cls._json_request(cls.staff_client.post, url, *args, **kwargs)
        else:
            return cls._json_request(cls.client.post, url, *args, **kwargs)

    @classmethod
    def put(cls, url, *args, **kwargs):
        if kwargs.get("staff", False):
            return cls._json_request(cls.staff_client.put, url, *args, **kwargs)
        else:
            return cls._json_request(cls.client.put, url, *args, **kwargs)

    @classmethod
    def patch(cls, url, *args, **kwargs):
        if kwargs.get("staff", False):
            return cls._json_request(cls.staff_client.patch, url, *args, **kwargs)
        else:
            return cls._json_request(cls.client.patch, url, *args, **kwargs)

    @classmethod
    def delete(cls, url, *args, **kwargs):
        if kwargs.get("staff", False):
            return cls._json_request(cls.staff_client.delete, url, *args, **kwargs)
        else:
            return cls._json_request(cls.client.delete, url, *args, **kwargs)
