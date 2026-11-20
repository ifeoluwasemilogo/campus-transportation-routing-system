from rest_framework import serializers

from .models import Route, ServiceNotice, Trip, Vehicle


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = (
            'id',
            'slug',
            'title',
            'origin',
            'destination',
            'mode',
            'duration_minutes',
            'distance_km',
            'fare',
            'active',
        )


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ('id', 'code', 'registration', 'capacity', 'accessible', 'status')


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ('id', 'route', 'vehicle', 'departure_at', 'status')


class ServiceNoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceNotice
        fields = ('id', 'title', 'message', 'status', 'created_at')
        read_only_fields = ('id', 'created_at')
