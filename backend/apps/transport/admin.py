from django.contrib import admin

from .models import Booking, Route, ServiceNotice, Trip, Vehicle


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('title', 'origin', 'destination', 'mode', 'fare', 'active')
    list_filter = ('mode', 'active')
    search_fields = ('title', 'origin', 'destination', 'slug')
    prepopulated_fields = {'slug': ('origin', 'destination')}


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('code', 'registration', 'capacity', 'accessible', 'status')
    list_filter = ('status', 'accessible')
    search_fields = ('code', 'registration')


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('route', 'vehicle', 'departure_at', 'status')
    list_filter = ('status', 'route')
    search_fields = ('route__title', 'vehicle__code')
    date_hierarchy = 'departure_at'


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('route_name', 'user', 'trip', 'status', 'booked_at')
    list_filter = ('status', 'booked_at')
    search_fields = ('route_name', 'user__email')
    readonly_fields = ('user', 'trip', 'route_name', 'origin', 'destination', 'fare', 'booked_at')


@admin.register(ServiceNotice)
class ServiceNoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'message')
