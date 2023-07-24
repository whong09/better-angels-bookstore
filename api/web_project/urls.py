from django.urls import include, re_path, path
from django.contrib import admin
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    re_path(r"^api/token/?$", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    re_path(r"^api/token/refresh/?$", TokenRefreshView.as_view(), name="token_refresh"),
    path("bookstore/", include("bookstoreapi.urls")),
    path("admin/", admin.site.urls),
]
