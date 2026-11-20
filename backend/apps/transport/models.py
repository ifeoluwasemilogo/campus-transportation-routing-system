from django.conf import settings
from django.db import models
from django.db.models import Q
from django.core.validators import MinValueValidator


class Route(models.Model):
    class Mode(models.TextChoices):
        SHUTTLE = 'SHUTTLE', 'Shuttle'
        WALK_SHUTTLE = 'WALK_SHUTTLE', 'Walk + shuttle'
        WALKING = 'WALKING', 'Walking path'

    slug = models.SlugField(max_length=60, unique=True)
    title = models.CharField(max_length=160)
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    mode = models.CharField(max_length=20, choices=Mode.choices, default=Mode.SHUTTLE)
    duration_minutes = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    distance_km = models.DecimalField(max_digits=5, decimal_places=2)
    fare = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class Vehicle(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance'
        INACTIVE = 'INACTIVE', 'Inactive'

    code = models.CharField(max_length=30, unique=True)
    registration = models.CharField(max_length=30, unique=True)
    capacity = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    accessible = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f'{self.code} ({self.registration})'


class Trip(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        DELAYED = 'DELAYED', 'Delayed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        COMPLETED = 'COMPLETED', 'Completed'

    route = models.ForeignKey(Route, on_delete=models.PROTECT, related_name='trips')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.PROTECT, related_name='trips')
    departure_at = models.DateTimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)

    class Meta:
        ordering = ['departure_at']
        constraints = [
            models.UniqueConstraint(
                fields=['route', 'vehicle', 'departure_at'],
                name='unique_vehicle_route_departure',
            ),
        ]

    def __str__(self):
        return f'{self.route.title} at {self.departure_at:%Y-%m-%d %H:%M}'


class ServiceNotice(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        RESOLVED = 'RESOLVED', 'Resolved'

    title = models.CharField(max_length=180)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Booking(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transport_bookings')
    trip = models.ForeignKey(Trip, on_delete=models.PROTECT, null=True, blank=True, related_name='bookings')
    route_id = models.CharField(max_length=40)
    route_name = models.CharField(max_length=160)
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    fare = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED)
    booked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-booked_at']
        constraints = [
            models.UniqueConstraint(
                fields=['trip', 'user'],
                condition=Q(status='CONFIRMED'),
                name='unique_confirmed_trip_booking_per_user',
            ),
        ]

    def __str__(self):
        return f'{self.route_name} ({self.user.email})'
