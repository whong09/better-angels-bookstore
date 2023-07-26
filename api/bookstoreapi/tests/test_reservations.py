import uuid
from django.urls import reverse
from rest_framework import status
from ..models import Book, Customer, Reservation
from ..serializers import ReservationSerializer, ReservationBookSerializer
from .utils import JWTTestCase


class ReservationAPITest(JWTTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.book = Book.objects.create(
            title="Test Book",
            author="Test Author",
            genre="Test Genre",
            quantity=5,
        )

    def test_create_reservation_success(self):
        url = reverse("reservations")
        data = {
            "book": str(self.book.id),
            "customer": str(self.user.customer.id),
            "quantity": 2,
        }

        response = self.post(url, data=data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        reservation = Reservation.objects.get(pk=response.data["id"])
        self.book.refresh_from_db()
        self.assertEqual(reservation.book, self.book)
        self.assertEqual(reservation.customer, self.user.customer)
        self.assertEqual(reservation.quantity, 2)
        self.assertEqual(self.book.quantity, 3)  # Book quantity should be updated

    def test_create_reservation_not_enough_books(self):
        url = reverse("reservations")
        data = {
            "book": str(self.book.id),
            "customer": str(self.user.customer.id),
            "quantity": 10,
        }

        response = self.post(url, data=data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Not enough books in stock")
        self.assertEqual(self.book.quantity, 5)  # Book quantity should not change

    def test_create_reservation_limit_exceeded(self):
        url = reverse("reservations")
        # Set the customer's max reservations to 1
        self.user.customer.max_reservations = 1
        self.user.customer.save()

        data = {
            "book": str(self.book.id),
            "customer": str(self.user.customer.id),
            "quantity": 2,
        }

        response = self.post(url, data=data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Reservation limit exceeded")
        self.assertEqual(self.book.quantity, 5)  # Book quantity should not change

    def test_get_all_reservations_for_customer(self):
        # Create a reservation for the customer
        reservation = Reservation.objects.create(
            book=self.book,
            customer=self.user.customer,
            quantity=1,
        )

        url = reverse("reservations")
        response = self.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        serializer = ReservationBookSerializer([reservation], many=True)
        self.assertEqual(response.data, serializer.data)

    def test_delete_reservation_success(self):
        # Create a reservation for the customer
        reservation = Reservation.objects.create(
            book=self.book,
            customer=self.user.customer,
            quantity=1,
        )

        url = reverse("reservation_delete", kwargs={"id": str(reservation.id)})
        response = self.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.book.refresh_from_db()
        self.assertFalse(Reservation.objects.filter(pk=reservation.id).exists())
        self.assertEqual(self.book.quantity, 6)  # Book quantity should be updated

    def test_delete_invalid_reservation(self):
        url = reverse("reservation_delete", kwargs={"id": uuid.uuid4()})
        response = self.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
