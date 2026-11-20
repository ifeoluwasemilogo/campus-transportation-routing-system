from django.db import transaction
from django.db.models import Count, F, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Booking, Route, ServiceNotice, Trip, Vehicle


class IsStudent(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'STUDENT'


class IsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'ADMIN'


def serialize_booking(booking):
    return {
        'id': booking.id,
        'routeId': booking.route_id,
        'route': booking.route_name,
        'origin': booking.origin,
        'destination': booking.destination,
        'fare': booking.fare,
        'status': booking.get_status_display(),
        'bookedAt': booking.booked_at.isoformat(),
        'departureAt': booking.trip.departure_at.isoformat() if booking.trip_id else None,
    }


def remaining_seats(trip):
    confirmed = trip.bookings.filter(status=Booking.Status.CONFIRMED).count()
    return max(0, trip.vehicle.capacity - confirmed)


def route_has_available_departure(route, accessible_only=False):
    trips = route.trips.filter(
        status__in=[Trip.Status.SCHEDULED, Trip.Status.DELAYED],
        departure_at__gte=timezone.now(),
        vehicle__status=Vehicle.Status.ACTIVE,
    )
    if route.mode == Route.Mode.WALKING:
        return False
    if accessible_only:
        trips = trips.filter(vehicle__accessible=True)
    return trips.annotate(
        confirmed_count=Count('bookings', filter=Q(bookings__status=Booking.Status.CONFIRMED))
    ).filter(confirmed_count__lt=F('vehicle__capacity')).exists()


class BookingListCreateView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        bookings = Booking.objects.filter(user=request.user)
        return Response([serialize_booking(booking) for booking in bookings])

    def post(self, request):
        route_slug = request.data.get('routeId')
        route = Route.objects.filter(slug=route_slug, active=True).first() if isinstance(route_slug, str) else None
        if route is None:
            return Response(
                {'detail': 'Select a valid route.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            trips = Trip.objects.select_for_update().select_related('route', 'vehicle').filter(
                route=route,
                route__mode__in=[Route.Mode.SHUTTLE, Route.Mode.WALK_SHUTTLE],
                status__in=[Trip.Status.SCHEDULED, Trip.Status.DELAYED],
                departure_at__gte=timezone.now(),
                vehicle__status=Vehicle.Status.ACTIVE,
            ).annotate(
                confirmed_count=Count('bookings', filter=Q(bookings__status=Booking.Status.CONFIRMED))
            ).exclude(
                bookings__user=request.user,
                bookings__status=Booking.Status.CONFIRMED,
            ).order_by('departure_at')

            trip = next(
                (candidate for candidate in trips if candidate.confirmed_count < candidate.vehicle.capacity),
                None,
            )
            if trip is None:
                return Response(
                    {'detail': 'There are no seats available for this route.'},
                    status=status.HTTP_409_CONFLICT,
                )
            booking = Booking.objects.create(
                user=request.user,
                trip=trip,
                route_id=route.slug,
                route_name=route.title,
                origin=route.origin,
                destination=route.destination,
                fare=route.fare,
            )
        return Response(serialize_booking(booking), status=status.HTTP_201_CREATED)


class BookingCancelView(APIView):
    permission_classes = [IsStudent]

    def patch(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id, user=request.user)
        if booking.status == Booking.Status.CANCELLED:
            return Response(
                {'detail': 'This booking has already been cancelled.'},
                status=status.HTTP_409_CONFLICT,
            )
        if booking.trip_id and booking.trip.departure_at <= timezone.now():
            return Response(
                {'detail': 'Bookings cannot be cancelled after the trip departure time.'},
                status=status.HTTP_409_CONFLICT,
            )

        booking.status = Booking.Status.CANCELLED
        booking.save(update_fields=['status'])
        return Response(serialize_booking(booking))


class AdminBookingListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        bookings = Booking.objects.select_related('user')[:50]
        return Response([
            {
                **serialize_booking(booking),
                'studentEmail': booking.user.email,
            }
            for booking in bookings
        ])


class StudentDashboardView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        routes = Route.objects.filter(active=True)
        upcoming_trips = list(Trip.objects.select_related('route', 'vehicle').filter(
            status__in=[Trip.Status.SCHEDULED, Trip.Status.DELAYED],
            departure_at__gte=timezone.now(),
            vehicle__status=Vehicle.Status.ACTIVE,
            route__mode__in=[Route.Mode.SHUTTLE, Route.Mode.WALK_SHUTTLE],
        ).order_by('departure_at'))
        upcoming_trips = [trip for trip in upcoming_trips if remaining_seats(trip) > 0]
        next_trip = upcoming_trips[0] if upcoming_trips else None
        confirmed_bookings = Booking.objects.filter(user=request.user, status=Booking.Status.CONFIRMED)
        today_bookings = confirmed_bookings.filter(booked_at__date=timezone.localdate()).count()
        upcoming_count = len(upcoming_trips)
        notices = ServiceNotice.objects.filter(status=ServiceNotice.Status.ACTIVE)
        next_departure_minutes = (
            max(0, int((next_trip.departure_at - timezone.now()).total_seconds() // 60))
            if next_trip else 0
        )

        return Response(
            {
                'student': {
                    'name': request.user.get_full_name() or request.user.email,
                    'activeBookingsCount': confirmed_bookings.count(),
                    'nextShuttle': {
                        'route': next_trip.route.title if next_trip else 'No upcoming shuttle',
                        'departure': timezone.localtime(next_trip.departure_at).strftime('%I:%M %p') if next_trip else '--',
                        'eta': f'{next_departure_minutes} min' if next_trip else '--',
                        'seatsLeft': remaining_seats(next_trip) if next_trip else 0,
                    },
                    'upcomingTrips': [
                        {
                            'route': trip.route.title,
                            'departure': timezone.localtime(trip.departure_at).strftime('%I:%M %p'),
                            'seatsLeft': remaining_seats(trip),
                            'mode': trip.route.get_mode_display(),
                            'vehicle': trip.vehicle.code,
                        }
                        for trip in upcoming_trips[:5]
                    ],
                    'stats': [
                        {'label': 'Active routes', 'value': str(routes.count()), 'trend': 'Available now'},
                        {'label': 'Upcoming departures', 'value': str(upcoming_count), 'trend': 'Scheduled trips'},
                        {'label': 'Operational vehicles', 'value': str(Vehicle.objects.filter(status=Vehicle.Status.ACTIVE).count()), 'trend': 'Ready for service'},
                        {'label': 'Bookings today', 'value': str(today_bookings), 'trend': 'Your confirmed seats'},
                    ],
                    'routeOptions': [
                        {
                            'id': route.slug,
                            'title': route.title,
                            'origin': route.origin,
                            'destination': route.destination,
                            'mode': route.get_mode_display(),
                            'time': f'{route.duration_minutes} min',
                            'distance': f'{route.distance_km} km',
                            'cost': f'₦{route.fare}' if route.fare else 'Free',
                            'tag': 'Accessible' if route_has_available_departure(route, accessible_only=True) else route.get_mode_display(),
                            'accessible': route_has_available_departure(route, accessible_only=True),
                            'bookable': route_has_available_departure(route),
                        }
                        for route in routes
                    ],
                    'bookings': [
                        serialize_booking(booking)
                        for booking in Booking.objects.filter(user=request.user)[:5]
                    ],
                    'notices': [
                        {
                            'title': notice.title,
                            'time': timezone.localtime(notice.created_at).strftime('%I:%M %p'),
                            'status': notice.get_status_display(),
                        }
                        for notice in notices
                    ],
                }
            }
        )


class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        vehicles = Vehicle.objects.all()
        active_vehicles = vehicles.filter(status=Vehicle.Status.ACTIVE).count()
        maintenance_vehicles = vehicles.filter(status=Vehicle.Status.MAINTENANCE).count()
        total_bookings = Booking.objects.filter(status=Booking.Status.CONFIRMED).count()
        upcoming_trips = Trip.objects.select_related('route', 'vehicle').filter(
            status__in=[Trip.Status.SCHEDULED, Trip.Status.DELAYED],
            departure_at__gte=timezone.now(),
            vehicle__status=Vehicle.Status.ACTIVE,
            route__mode__in=[Route.Mode.SHUTTLE, Route.Mode.WALK_SHUTTLE],
        )
        notices = ServiceNotice.objects.all()[:10]

        return Response(
            {
                'admin': {
                    'fleetStatus': {'current': active_vehicles, 'total': vehicles.count()},
                    'maintenanceVehicles': maintenance_vehicles,
                    'stats': [
                        {'label': 'Fleet status', 'value': f'{active_vehicles}/{vehicles.count()}'},
                        {'label': 'Upcoming trips', 'value': str(upcoming_trips.count())},
                        {'label': 'Active notices', 'value': str(ServiceNotice.objects.filter(status=ServiceNotice.Status.ACTIVE).count())},
                        {'label': 'Confirmed bookings', 'value': str(total_bookings)},
                    ],
                    'routes': [
                        {
                            'route': trip.route.title,
                            'driver': trip.vehicle.code,
                            'status': trip.get_status_display(),
                            'load': f'{round((trip.vehicle.capacity - remaining_seats(trip)) / trip.vehicle.capacity * 100)}%' if trip.vehicle.capacity else '0%',
                        }
                        for trip in upcoming_trips[:5]
                    ],
                    'alerts': [
                        {
                            'title': notice.title,
                            'time': timezone.localtime(notice.created_at).strftime('%I:%M %p'),
                            'status': notice.get_status_display(),
                        }
                        for notice in notices
                    ],
                }
            }
        )
