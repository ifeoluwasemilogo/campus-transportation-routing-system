from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Route, ServiceNotice, Trip, Vehicle


class BookingApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.student = user_model.objects.create_user(
            username='student@test.edu',
            email='student@test.edu',
            password='test-password',
            role='STUDENT',
        )
        self.admin = user_model.objects.create_user(
            username='admin@test.edu',
            email='admin@test.edu',
            password='test-password',
            role='ADMIN',
            is_staff=True,
        )
        self.route = Route.objects.create(
            slug='main-gate-engineering',
            title='Main Gate → Faculty of Engineering',
            origin='Main Gate',
            destination='Faculty of Engineering',
            mode=Route.Mode.WALK_SHUTTLE,
            duration_minutes=18,
            distance_km='1.40',
            fare=300,
        )
        self.vehicle = Vehicle.objects.create(
            code='UI-01',
            registration='UIA-001',
            capacity=1,
        )
        self.trip = Trip.objects.create(
            route=self.route,
            vehicle=self.vehicle,
            departure_at=timezone.now() + timedelta(hours=1),
        )

    def test_student_can_create_and_list_own_booking(self):
        self.client.force_authenticate(self.student)

        response = self.client.post(
            '/api/transport/bookings/',
            {'routeId': 'main-gate-engineering'},
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['route'], 'Main Gate → Faculty of Engineering')
        self.assertEqual(response.data['fare'], 300)

        list_response = self.client.get('/api/transport/bookings/')
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 1)

    def test_invalid_route_is_rejected_and_admin_cannot_book_as_student(self):
        self.client.force_authenticate(self.student)
        invalid_response = self.client.post(
            '/api/transport/bookings/',
            {'routeId': 'not-a-route'},
            format='json',
        )
        self.assertEqual(invalid_response.status_code, 400)

        self.client.force_authenticate(self.admin)
        admin_response = self.client.get('/api/transport/bookings/')
        self.assertEqual(admin_response.status_code, 403)

    def test_student_can_cancel_only_their_own_booking_once(self):
        self.client.force_authenticate(self.student)
        booking_response = self.client.post(
            '/api/transport/bookings/',
            {'routeId': 'main-gate-engineering'},
            format='json',
        )
        booking_id = booking_response.data['id']

        cancel_response = self.client.patch(f'/api/transport/bookings/{booking_id}/')
        self.assertEqual(cancel_response.status_code, 200)
        self.assertEqual(cancel_response.data['status'], 'Cancelled')

        duplicate_response = self.client.patch(f'/api/transport/bookings/{booking_id}/')
        self.assertEqual(duplicate_response.status_code, 409)

        other_student = get_user_model().objects.create_user(
            username='other@test.edu',
            email='other@test.edu',
            password='test-password',
            role='STUDENT',
        )
        self.client.force_authenticate(other_student)
        foreign_response = self.client.patch(f'/api/transport/bookings/{booking_id}/')
        self.assertEqual(foreign_response.status_code, 404)

    def test_only_admin_can_review_all_bookings(self):
        self.client.force_authenticate(self.student)
        self.client.post(
            '/api/transport/bookings/',
            {'routeId': 'main-gate-engineering'},
            format='json',
        )

        self.client.force_authenticate(self.admin)
        admin_response = self.client.get('/api/transport/admin/bookings/')
        self.assertEqual(admin_response.status_code, 200)
        self.assertEqual(len(admin_response.data), 1)
        self.assertEqual(admin_response.data[0]['studentEmail'], self.student.email)

        self.client.force_authenticate(self.student)
        student_response = self.client.get('/api/transport/admin/bookings/')
        self.assertEqual(student_response.status_code, 403)

    def test_booking_reserves_one_seat_and_rejects_full_trip(self):
        self.client.force_authenticate(self.student)
        first_response = self.client.post(
            '/api/transport/bookings/',
            {'routeId': self.route.slug},
            format='json',
        )
        self.assertEqual(first_response.status_code, 201)
        self.assertEqual(first_response.data['departureAt'], self.trip.departure_at.isoformat())

        other_student = get_user_model().objects.create_user(
            username='other@test.edu',
            email='other@test.edu',
            password='test-password',
            role='STUDENT',
        )
        self.client.force_authenticate(other_student)
        full_response = self.client.post(
            '/api/transport/bookings/',
            {'routeId': self.route.slug},
            format='json',
        )
        self.assertEqual(full_response.status_code, 409)

    def test_student_dashboard_uses_database_routes_and_departures(self):
        self.client.force_authenticate(self.student)
        response = self.client.get('/api/transport/dashboard/student/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['student']['routeOptions'][0]['id'], self.route.slug)
        self.assertTrue(response.data['student']['routeOptions'][0]['bookable'])
        self.assertEqual(response.data['student']['upcomingTrips'][0]['route'], self.route.title)

    def test_booking_cannot_be_cancelled_after_departure(self):
        self.client.force_authenticate(self.student)
        booking_response = self.client.post(
            '/api/transport/bookings/',
            {'routeId': self.route.slug},
            format='json',
        )
        self.trip.departure_at = timezone.now() - timedelta(minutes=1)
        self.trip.save(update_fields=['departure_at'])

        response = self.client.patch(f"/api/transport/bookings/{booking_response.data['id']}/")
        self.assertEqual(response.status_code, 409)


class AdminManagementApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.admin = user_model.objects.create_user(
            username='admin@test.edu',
            email='admin@test.edu',
            password='test-password',
            role='ADMIN',
        )
        self.student = user_model.objects.create_user(
            username='student@test.edu',
            email='student@test.edu',
            password='test-password',
            role='STUDENT',
        )
        self.route = Route.objects.create(
            slug='main-gate-engineering',
            title='Main Gate to Engineering',
            origin='Main Gate',
            destination='Engineering',
            duration_minutes=18,
            distance_km='1.40',
            fare=300,
        )
        self.vehicle = Vehicle.objects.create(
            code='UI-01',
            registration='UIA-001',
            capacity=24,
        )
        self.client.force_authenticate(self.admin)

    def test_admin_can_manage_routes_vehicles_trips_and_notices(self):
        route_response = self.client.post('/api/transport/admin/routes/', {
            'slug': 'hall-library',
            'title': 'Hall to Library',
            'origin': 'Hall',
            'destination': 'Library',
            'mode': Route.Mode.SHUTTLE,
            'duration_minutes': 12,
            'distance_km': '1.10',
            'fare': 250,
            'active': True,
        }, format='json')
        self.assertEqual(route_response.status_code, 201)
        route_id = route_response.data['id']

        vehicle_response = self.client.post('/api/transport/admin/vehicles/', {
            'code': 'UI-02',
            'registration': 'UIA-002',
            'capacity': 18,
            'accessible': True,
            'status': Vehicle.Status.ACTIVE,
        }, format='json')
        self.assertEqual(vehicle_response.status_code, 201)
        vehicle_id = vehicle_response.data['id']

        trip_response = self.client.post('/api/transport/admin/trips/', {
            'route': route_id,
            'vehicle': vehicle_id,
            'departure_at': (timezone.now() + timedelta(hours=2)).isoformat(),
            'status': Trip.Status.SCHEDULED,
        }, format='json')
        self.assertEqual(trip_response.status_code, 201)

        notice_response = self.client.post('/api/transport/admin/notices/', {
            'title': 'Route update',
            'message': 'The route is operating normally.',
            'status': ServiceNotice.Status.ACTIVE,
        }, format='json')
        self.assertEqual(notice_response.status_code, 201)
        notice_id = notice_response.data['id']

        update_response = self.client.patch(
            f'/api/transport/admin/notices/{notice_id}/',
            {'status': ServiceNotice.Status.RESOLVED},
            format='json',
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.data['status'], ServiceNotice.Status.RESOLVED)

    def test_management_endpoints_are_admin_only_and_protected_records_cannot_be_deleted(self):
        self.client.force_authenticate(self.student)
        forbidden_response = self.client.get('/api/transport/admin/routes/')
        self.assertEqual(forbidden_response.status_code, 403)

        self.client.force_authenticate(self.admin)
        Trip.objects.create(
            route=self.route,
            vehicle=self.vehicle,
            departure_at=timezone.now() + timedelta(hours=1),
        )
        response = self.client.delete(f'/api/transport/admin/routes/{self.route.id}/')
        self.assertEqual(response.status_code, 409)

    def test_django_admin_web_interface_is_not_exposed(self):
        response = self.client.get('/admin/')

        self.assertEqual(response.status_code, 404)
