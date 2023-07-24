from django.contrib.postgres.search import SearchVector
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from ..models import Book
from ..serializers import BookSerializer
from .authentication import JWTAuthenticatedView

from django.contrib.admin.views.decorators import staff_member_required


class BookAPIView(JWTAuthenticatedView, PageNumberPagination):
    """
    Book API View
    """

    @staff_member_required
    def get(self, request):
        """
        Get all books
        """
        books = Book.objects.all()
        paged_books = self.paginate_queryset(books, request, view=self)
        serializer = BookSerializer(paged_books, many=True)
        return self.get_paginated_response(serializer.data)

    @staff_member_required
    def post(self, request):
        """
        Create a new book
        """
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            (Book.objects.filter(pk=serializer.data["id"]).update(search_vector=SearchVector("title", "author", "genre")))
            return Response(
                {"message": "Created book", "id": serializer.data["id"]},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def book_search(request):
    """
    Search for books, not part of the BookAPIView class
    """
    paginator = PageNumberPagination()
    paginator.page_size = 50
    query = request.query_params.get("query")
    if query is None or len(query) < 3:
        return Response({"message": "Missing or invalid query"}, status=status.HTTP_400_BAD_REQUEST)
    books = Book.objects.search(query)
    paged_books = paginator.paginate_queryset(books, request, view=book_search)
    serializer = BookSerializer(paged_books, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET"])
def book_popular(request):
    """
    Get the most popular books
    """
    paginator = PageNumberPagination()
    paginator.page_size = 50
    books = Book.objects.order_by("-popularity")[:999]
    paged_books = paginator.paginate_queryset(books, request, view=book_popular)
    serializer = BookSerializer(paged_books, many=True)
    return paginator.get_paginated_response(serializer.data)


class BookDetailAPIView(JWTAuthenticatedView):
    """
    Book Detail API View
    """

    def get(self, request, id):
        """
        Get a book by id
        """
        try:
            book = Book.objects.get(pk=id)
        except Book.DoesNotExist:
            return Response({"message": "Book not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = BookSerializer(book)
        return Response(serializer.data)

    @staff_member_required
    def delete(self, request, id):
        """
        Delete a book by id
        """
        try:
            book = Book.objects.get(pk=id)
        except Book.DoesNotExist:
            return Response({"message": "Book not found"}, status=status.HTTP_404_NOT_FOUND)
        book.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @staff_member_required
    def put(self, request, id):
        """
        Update a book by id
        """
        try:
            book = Book.objects.get(pk=id)
        except Book.DoesNotExist:
            return Response({"message": "Book not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = BookSerializer(book, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
