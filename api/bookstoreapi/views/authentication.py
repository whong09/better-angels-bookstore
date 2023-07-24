import os

import jwt
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication


class JWTAuthenticatedView(APIView):
    authentication_classes = [JWTAuthentication]

    def dispatch(self, request, *args, **kwargs):
        try:
            # Get the authenticated user from JWT token
            user = self.get_user_from_jwt_token(request)
            request.user = user
        except AuthenticationFailed as e:
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        return super().dispatch(request, *args, **kwargs)

    def get_user_from_jwt_token(self, request):
        # Get the token from the Authorization header
        auth_header = request.META.get("HTTP_AUTHORIZATION", "").split()
        if not auth_header or len(auth_header) != 2:
            raise AuthenticationFailed("Invalid Authorization header")

        if auth_header[0].lower() != "bearer":
            raise AuthenticationFailed("Invalid Authorization header format")

        token = auth_header[1]

        try:
            # decode the token
            payload = jwt.decode(token, os.environ.get("DJANGO_SECRET_KEY"), algorithms=["HS256"])
            return User.objects.get(pk=payload["user_id"])
        except Exception:
            print(Exception)
            raise AuthenticationFailed("Invalid or expired token")
