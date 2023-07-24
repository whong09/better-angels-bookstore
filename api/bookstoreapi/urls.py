from django.contrib import admin
from django.urls import path, re_path

from .views.book import BookAPIView, BookDetailAPIView, book_search, book_popular
from .views.customer import CustomerAPIView, CustomerCreateAPIView, CustomerDetailAPIView, CustomerLookupAPIView
from .views.reservation import ReservationAPIView, ReservationDeleteAPIView

urlpatterns = [
    re_path(r"^books/?$", BookAPIView.as_view(), name="books"),
    re_path(r"^books/search/?$", book_search, name="books_search"),
    re_path(r"^books/popular/?$", book_popular, name="books_popular"),
    re_path(r"^books/(?P<id>[0-9a-f-]+)/?$", BookDetailAPIView.as_view(), name="book_detail"),
    re_path(r"^customers/?$", CustomerAPIView.as_view(), name="customers"),
    re_path(r"^customers/create/?$", CustomerCreateAPIView.as_view(), name="customer_create"),
    re_path(r"^customers/lookup/?$", CustomerLookupAPIView.as_view(), name="customer_lookup"),
    re_path(r"^customers/(?P<id>[0-9a-f-]+)/?$", CustomerDetailAPIView.as_view(), name="customer_detail"),
    re_path(r"^reservations/?$", ReservationAPIView.as_view(), name="reservations"),
    re_path(r"^reservations/(?P<id>[0-9a-f-]+)/?$", ReservationDeleteAPIView.as_view(), name="reservation_delete"),
]
