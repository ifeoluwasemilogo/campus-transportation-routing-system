from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.transport.models import Route, ServiceNotice, Trip, Vehicle


class Command(BaseCommand):
    help = 'Create starter campus routes, fleet, departures, and service notices.'

    def handle(self, *args, **options):
        routes = [
            {
                'slug': 'main-gate-engineering',
                'title': 'Main Gate → Faculty of Engineering',
                'origin': 'Main Gate',
                'destination': 'Faculty of Engineering',
                'mode': Route.Mode.WALK_SHUTTLE,
                'duration_minutes': 18,
                'distance_km': '1.40',
                'fare': 300,
            },
            {
                'slug': 'hall-library',
                'title': 'University Hall → Library',
                'origin': 'University Hall',
                'destination': 'Library',
                'mode': Route.Mode.SHUTTLE,
                'duration_minutes': 12,
                'distance_km': '1.10',
                'fare': 250,
            },
            {
                'slug': 'quarters-student-center',
                'title': 'Staff Quarters → Student Center',
                'origin': 'Staff Quarters',
                'destination': 'Student Center',
                'mode': Route.Mode.WALKING,
                'duration_minutes': 9,
                'distance_km': '0.80',
                'fare': 0,
            },
        ]
        vehicles = [
            {'code': 'UI-01', 'registration': 'UIA-001', 'capacity': 24, 'accessible': True},
            {'code': 'UI-02', 'registration': 'UIA-002', 'capacity': 18, 'accessible': False},
            {'code': 'UI-03', 'registration': 'UIA-003', 'capacity': 30, 'accessible': True},
        ]

        route_objects = {
            entry['slug']: Route.objects.update_or_create(slug=entry['slug'], defaults=entry)[0]
            for entry in routes
        }
        vehicle_objects = {
            entry['code']: Vehicle.objects.update_or_create(code=entry['code'], defaults=entry)[0]
            for entry in vehicles
        }

        now = timezone.now()
        for route_slug, vehicle_code, minutes in [
            ('main-gate-engineering', 'UI-01', 15),
            ('hall-library', 'UI-02', 35),
        ]:
            route = route_objects[route_slug]
            if not Trip.objects.filter(route=route, departure_at__gte=now).exists():
                Trip.objects.create(
                    route=route,
                    vehicle=vehicle_objects[vehicle_code],
                    departure_at=now + timedelta(minutes=minutes),
                )

        ServiceNotice.objects.get_or_create(
            title='Welcome to campus transit',
            defaults={
                'message': 'Check the route planner for available shuttle departures.',
                'status': ServiceNotice.Status.ACTIVE,
            },
        )
        self.stdout.write(self.style.SUCCESS('Starter transport data is ready.'))
