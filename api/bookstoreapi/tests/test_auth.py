from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


class AuthAPITest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.client = APIClient()

        cls.client = APIClient()
        cls.user = User.objects.create_user(username="testuser", password="testpassword")
        response = cls.client.post(
            reverse("token_obtain_pair"), {"username": "testuser", "password": "testpassword"}, format="json"
        )
        cls.access_token = response.data["access"]
        cls.refresh_token = response.data["refresh"]

    def test_get_token(self):
        # Define the endpoint URL
        url = reverse("token_obtain_pair")

        # Send a POST request to get the token
        response = self.client.post(url, {"username": "testuser", "password": "testpassword"}, format="json")

        # Assert that the request was successful (status code 200) and the token was generated
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_refresh_token(self):
        # Send a POST request to refresh the token
        url = reverse("token_refresh")
        data = {"refresh": str(self.refresh_token)}
        response = self.client.post(url, data, format="json")

        # Assert that the response status is HTTP_200_OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Assert that a new access token is returned
        self.assertIn("access", response.data)
        new_access_token = response.data["access"]

        # Assert that the new access token is not the same as the old one
        self.assertNotEqual(new_access_token, self.access_token)

        # Update the access token to the new one for future tests
        self.access_token = new_access_token
