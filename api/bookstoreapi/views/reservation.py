import json
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response

from ..models import Book, Customer, Reservation
from ..serializers import ReservationBookSerializer, ReservationSerializer
from .authentication import JWTAuthenticatedView

from datetime import datetime


class ReservationAPIView(JWTAuthenticatedView):
    """
    Reservation API View
    """

    @transaction.atomic
    def post(self, request):
        """
        Create a new reservation only if the book is in stock and the user has not exceeded their reservation limit
        """
        book = Book.objects.filter(pk=request.data["book"]).first()
        if book is None:
            return Response({"message": "Book not found"}, status=status.HTTP_404_NOT_FOUND)
        if book.quantity < request.data["quantity"]:
            return Response(
                {"message": "Not enough books in stock"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        customer = Customer.objects.filter(pk=request.data["customer"]).first()
        if customer is None:
            return Response({"message": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)
        if customer.current_reservations + request.data["quantity"] > customer.max_reservations:
            return Response(
                {"message": "Reservation limit exceeded"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ReservationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            book.quantity -= request.data["quantity"]
            book.save()
            customer.current_reservations += request.data["quantity"]
            customer.save()
            book.refresh_from_db()
            assert book.quantity >= 0, "Book was reserved more times than it was in stock"
            return Response(
                {"message": "Created reservation", "id": serializer.data["id"]}, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        """
        Get all reservations and books for the current user, joining reservation and book on book id
        """
        reservations = Reservation.objects.filter(customer=request.user.customer.id).select_related("book")
        serializer = ReservationBookSerializer(reservations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ReservationDeleteAPIView(JWTAuthenticatedView):
    """
    Reservation Delete API View
    """

    def delete(self, request, id):
        """
        Delete a reservation
        """
        try:
            reservation = Reservation.objects.get(pk=id)
        except Reservation.DoesNotExist:
            return Response({"message": "Reservation not found"}, status=status.HTTP_404_NOT_FOUND)
        # auto-generated code, it made the correct choice not to give a 400 so the request doesn't give away whether a reservation exists
        if reservation.customer.id != request.user.customer.id:
            return Response({"message": "Reservation not found"}, status=status.HTTP_404_NOT_FOUND)
        book = reservation.book
        book.quantity += reservation.quantity
        book.save()
        customer = reservation.customer
        customer.current_reservations -= reservation.quantity
        customer.save()
        reservation.delete()
        return Response({"message": "Deleted reservation"}, status=status.HTTP_200_OK)
