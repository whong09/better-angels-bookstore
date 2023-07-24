from django.contrib import admin
from .models import Book, Customer, Reservation

# Register your models here.
admin.site.register(Book)
admin.site.register(Customer)
admin.site.register(Reservation)
