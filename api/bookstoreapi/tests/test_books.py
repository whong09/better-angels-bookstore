from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate
from ..models import Book
from ..serializers import BookSerializer
from .utils import JWTTestCase

import uuid


class StaffBookTests(JWTTestCase):
    def test_non_staff_access(self):
        url = reverse("books")
        response = self.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.post(url, kwargs={"id": "invalid_id"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_all_books(self):
        # Create some test books
        Book.objects.create(title="Book 1", author="Author 1", genre="Genre 1")
        Book.objects.create(title="Book 2", author="Author 2", genre="Genre 2")

        # Make a GET request to the endpoint
        url = reverse("books")
        response = self.get(url, staff=True)

        # Get the books from the database
        books = Book.objects.all()
        serializer = BookSerializer(books, many=True)

        # Compare response data with serialized data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("results"), serializer.data)

    def test_create_new_book(self):
        # Data for creating a new book
        data = {
            "title": "New Book",
            "author": "New Author",
            "genre": "New Genre",
        }

        # Make a POST request to create a new book
        response = self.post(reverse("books"), data=data, staff=True)

        # Check if the book was created successfully
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Book.objects.count(), 1)
        self.assertEqual(Book.objects.get().title, data["title"])
        self.assertEqual(Book.objects.get().author, data["author"])
        self.assertEqual(Book.objects.get().genre, data["genre"])

    def test_create_new_book_invalid_data(self):
        # Data with missing required fields
        data = {
            "title": "New Book",
        }

        # Make a POST request with missing required fields
        response = self.post(reverse("books"), data=data, staff=True)

        # Check if the request returns a 400 bad request status code
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_book_by_id(self):
        # Create a test book
        book = Book.objects.create(title="Book 1", author="Author 1", genre="Genre 1")

        # Make a GET request to the book detail endpoint
        response = self.get(reverse("book_detail", kwargs={"id": book.id}))

        # Get the book details from the database
        serializer = BookSerializer(book)

        # Compare response data with serialized data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_get_book_by_invalid_id(self):
        # Make a GET request to the book detail endpoint with an invalid id
        response = self.get(reverse("book_detail", kwargs={"id": uuid.uuid4()}))

        # Check if the request returns a 404 not found status code
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_book(self):
        # Create a test book
        book = Book.objects.create(title="Book 1", author="Author 1", genre="Genre 1")

        # Data for updating the book
        data = {
            "title": "Updated Book",
            "author": "Updated Author",
            "genre": "Updated Genre",
        }

        # Make a PUT request to update the book
        response = self.put(reverse("book_detail", kwargs={"id": book.id}), data=data, staff=True)

        # Check if the book was updated successfully
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        book.refresh_from_db()
        self.assertEqual(book.title, data["title"])
        self.assertEqual(book.author, data["author"])
        self.assertEqual(book.genre, data["genre"])

    def test_update_invalid_book(self):
        # Data for updating the book with missing required fields
        data = {
            "title": "Updated Book",
        }

        # Make a PUT request with missing required fields
        response = self.put(reverse("book_detail", kwargs={"id": uuid.uuid4()}), data=data, staff=True)

        # Check if the request returns a 404 not found status code
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_book(self):
        # Create a test book
        book = Book.objects.create(title="Book 1", author="Author 1", genre="Genre 1")

        # Make a DELETE request to delete the book
        response = self.delete(reverse("book_detail", kwargs={"id": book.id}), staff=True)

        # Check if the book was deleted successfully
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Book.objects.count(), 0)

    def test_delete_invalid_book(self):
        # Make a DELETE request to delete a book with an invalid id
        response = self.delete(reverse("book_detail", kwargs={"id": uuid.uuid4()}), staff=True)

        # Check if the request returns a 404 not found status code
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
