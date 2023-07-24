from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Book, Customer, Reservation


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "date_joined",
            "password",
        ]


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ["id", "title", "author", "genre", "quantity"]


class CustomerSerializer(serializers.ModelSerializer):
    user = UserSerializer(required=False)

    class Meta:
        model = Customer
        fields = ["id", "user", "mailing_address", "max_reservations", "current_reservations"]

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        user = User.objects.create_user(**user_data)
        customer = Customer.objects.create(user=user, **validated_data)
        return customer

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user")
        if "first_name" in user_data:
            instance.user.first_name = user_data["first_name"]
        if "last_name" in user_data:
            instance.user.last_name = user_data["last_name"]
        if "email" in user_data:
            instance.user.email = user_data["email"]
            instance.user.save()
        if "mailing_address" in validated_data:
            instance.mailing_address = validated_data["mailing_address"]
            instance.save()
        customer = Customer.objects.get(pk=instance.id)
        return customer


class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = "__all__"


class ReservationBookSerializer(serializers.ModelSerializer):
    book = BookSerializer()

    class Meta:
        model = Reservation
        fields = "__all__"
