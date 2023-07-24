from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..decorators import customer_authorization
from ..models import Customer
from ..serializers import CustomerSerializer
from .authentication import JWTAuthenticatedView


@permission_classes((AllowAny,))
class CustomerCreateAPIView(APIView):
    """
    Customer Create API View
    Must be public to allow users to create an account
    """

    def post(self, request):
        """
        Create a new customer
        """
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Created customer", "id": serializer.data["id"]},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomerAPIView(JWTAuthenticatedView, PageNumberPagination):
    """
    Customer API View
    """

    def get(self, request):
        """
        Get all customers
        Only allow admins to view all customers
        """
        if not request.user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN)
        customers = Customer.objects.all()
        paged_customers = self.paginate_queryset(customers, request, view=self)
        serializer = CustomerSerializer(paged_customers, many=True)
        return self.get_paginated_response(serializer.data)


class CustomerLookupAPIView(JWTAuthenticatedView):
    """
    Customer Lookup API View
    This is necessary because when logging in with a username, we need to get the customer id
    """

    def get(self, request):
        """
        Get a customer by username
        """
        try:
            customer = Customer.objects.get(user__username=request.query_params["username"])
        except Customer.DoesNotExist:
            return Response({"message": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = CustomerSerializer(customer)
        # remove password
        serializer.data["user"].pop("password")
        return Response(serializer.data)


class CustomerDetailAPIView(JWTAuthenticatedView):
    """
    Customer Detail API View
    """

    @customer_authorization
    def get(self, request, id):
        """
        Get a customer by id
        """
        try:
            customer = Customer.objects.get(pk=id)
        except Customer.DoesNotExist:
            return Response({"message": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = CustomerSerializer(customer)
        # remove password, even though it's hashed
        serializer.data["user"].pop("password")
        return Response(serializer.data)

    @customer_authorization
    def delete(self, request, id):
        """
        Delete a customer by id
        """
        try:
            customer = Customer.objects.get(pk=id)
        except Customer.DoesNotExist:
            return Response({"message": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)
        customer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @customer_authorization
    def patch(self, request, id):
        """
        Update a customer by id
        """
        try:
            customer = Customer.objects.get(pk=id)
        except Customer.DoesNotExist:
            return Response({"message": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = CustomerSerializer(customer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # remove password, even though it's hashed
            serializer.data["user"].pop("password")
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
