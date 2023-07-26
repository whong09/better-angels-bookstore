from functools import wraps
from rest_framework import status
from rest_framework.response import Response
from .models import Reservation


def customer_authorization(view_func):
    @wraps(view_func)
    def _view(view, request, id, *args, **kwargs):
        if not request.user.is_staff and str(request.user.customer.id) != id:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return view_func(view, request, id, *args, **kwargs)

    return _view


def staff_member_required(view_func):
    @wraps(view_func)
    def _view(view, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return view_func(view, request, *args, **kwargs)

    return _view
