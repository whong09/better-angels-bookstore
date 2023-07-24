import uuid

from django.conf import settings
from django.contrib.postgres.indexes import HashIndex
from django.contrib.postgres.search import SearchVectorField
from django.db import models

from .managers import BookManager


class Book(models.Model):
    """
    Book model with title, author, genre, quantity
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100)
    author = models.CharField(max_length=100)
    genre = models.CharField(max_length=100)
    popularity = models.IntegerField(default=0)
    quantity = models.IntegerField()
    image_url = models.CharField(max_length=100, null=True)
    search_vector = SearchVectorField(null=True, editable=False)

    objects = BookManager()

    def __str__(self):
        return f"{id}:self.title"


class Customer(models.Model):
    """
    Customer model with user, mailing_address, max_reservations
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    mailing_address = models.CharField(max_length=100, null=True)
    max_reservations = models.IntegerField(default=30)
    current_reservations = models.IntegerField(default=0)

    def __str__(self):
        return self.user.username


class Reservation(models.Model):
    """
    Reservation model with customer, book, quantity, and date
    Hash indexes on customer and book make it fast to query reservations for a customer or book
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=False)
    book = models.ForeignKey(Book, on_delete=models.CASCADE, null=False)
    quantity = models.IntegerField(null=False)
    date = models.DateField(auto_now_add=True, null=False)

    class Meta:
        indexes = [HashIndex(fields=["customer"]), HashIndex(fields=["book"])]

    def __str__(self):
        return f"{self.customer} - {self.book} - {self.quantity} - {self.date}"
