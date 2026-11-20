from django.db.models.deletion import ProtectedError
from rest_framework import status, viewsets
from rest_framework.response import Response

from .models import Route, ServiceNotice, Trip, Vehicle
from .serializers import RouteSerializer, ServiceNoticeSerializer, TripSerializer, VehicleSerializer
from .views import IsAdmin


class AdminModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
        except ProtectedError:
            return Response(
                {'detail': 'This record is in use and cannot be deleted.'},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminRouteViewSet(AdminModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer


class AdminVehicleViewSet(AdminModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer


class AdminTripViewSet(AdminModelViewSet):
    queryset = Trip.objects.select_related('route', 'vehicle').all()
    serializer_class = TripSerializer


class AdminServiceNoticeViewSet(AdminModelViewSet):
    queryset = ServiceNotice.objects.all()
    serializer_class = ServiceNoticeSerializer
