from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework.test import APITestCase


@override_settings(PASSWORD_HASHERS=['django.contrib.auth.hashers.MD5PasswordHasher'])
class LoginApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='student@test.edu',
            email='student@test.edu',
            password='strong-test-password',
            role='STUDENT',
        )

    def test_login_returns_role_and_both_jwt_tokens(self):
        response = self.client.post(
            '/api/accounts/login/',
            {'email': 'STUDENT@test.edu', 'password': 'strong-test-password'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['role'], 'student')
        self.assertTrue(response.data['tokens']['access'])
        self.assertTrue(response.data['tokens']['refresh'])

    def test_login_rejects_bad_credentials_and_malformed_input(self):
        bad_password = self.client.post(
            '/api/accounts/login/',
            {'email': 'student@test.edu', 'password': 'wrong-password'},
            format='json',
        )
        malformed = self.client.post(
            '/api/accounts/login/',
            {'email': 123, 'password': []},
            format='json',
        )

        self.assertEqual(bad_password.status_code, 401)
        self.assertEqual(malformed.status_code, 400)

    def test_logout_blacklists_the_refresh_token(self):
        login = self.client.post(
            '/api/accounts/login/',
            {'email': 'student@test.edu', 'password': 'strong-test-password'},
            format='json',
        )
        refresh_token = login.data['tokens']['refresh']

        logout = self.client.post(
            '/api/accounts/logout/',
            {'refresh': refresh_token},
            format='json',
        )
        refresh_attempt = self.client.post(
            '/api/accounts/token/refresh/',
            {'refresh': refresh_token},
            format='json',
        )

        self.assertEqual(logout.status_code, 200)
        self.assertEqual(refresh_attempt.status_code, 401)

    def test_refresh_requires_a_refresh_token(self):
        login = self.client.post(
            '/api/accounts/login/',
            {'email': 'student@test.edu', 'password': 'strong-test-password'},
            format='json',
        )

        response = self.client.post(
            '/api/accounts/token/refresh/',
            {'refresh': login.data['tokens']['access']},
            format='json',
        )

        self.assertEqual(response.status_code, 401)
        self.assertIn('refresh token is expired, revoked, or invalid', response.data['detail'])

    def test_signing_in_on_another_device_does_not_invalidate_existing_session(self):
        first_login = self.client.post(
            '/api/accounts/login/',
            {'email': 'student@test.edu', 'password': 'strong-test-password'},
            format='json',
        )
        second_login = self.client.post(
            '/api/accounts/login/',
            {'email': 'student@test.edu', 'password': 'strong-test-password'},
            format='json',
        )

        self.assertNotEqual(first_login.data['tokens']['refresh'], second_login.data['tokens']['refresh'])
        first_refresh = self.client.post(
            '/api/accounts/token/refresh/',
            {'refresh': first_login.data['tokens']['refresh']},
            format='json',
        )
        second_refresh = self.client.post(
            '/api/accounts/token/refresh/',
            {'refresh': second_login.data['tokens']['refresh']},
            format='json',
        )

        self.assertEqual(first_refresh.status_code, 200)
        self.assertEqual(second_refresh.status_code, 200)

        first_logout = self.client.post(
            '/api/accounts/logout/',
            {'refresh': first_login.data['tokens']['refresh']},
            format='json',
        )
        first_device_after_logout = self.client.post(
            '/api/accounts/token/refresh/',
            {'refresh': first_login.data['tokens']['refresh']},
            format='json',
        )
        second_device_after_logout = self.client.post(
            '/api/accounts/token/refresh/',
            {'refresh': second_login.data['tokens']['refresh']},
            format='json',
        )

        self.assertEqual(first_logout.status_code, 200)
        self.assertEqual(first_device_after_logout.status_code, 401)
        self.assertEqual(second_device_after_logout.status_code, 200)


@override_settings(PASSWORD_HASHERS=['django.contrib.auth.hashers.MD5PasswordHasher'])
class StudentRegistrationApiTests(APITestCase):
    def setUp(self):
        get_user_model().objects.create_user(
            username='student@test.edu',
            email='student@test.edu',
            password='strong-test-password',
            role='STUDENT',
        )

    def test_registration_creates_student_even_if_client_submits_admin_role(self):
        response = self.client.post(
            '/api/accounts/register/',
            {
                'first_name': 'New',
                'last_name': 'Student',
                'email': '  NEW.STUDENT@UI.EDU.NG ',
                'password': 'valid-student-password-782',
                'role': 'ADMIN',
                'is_staff': True,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        user = get_user_model().objects.get(email='new.student@ui.edu.ng')
        self.assertEqual(user.role, 'STUDENT')
        self.assertFalse(user.is_staff)
        self.assertTrue(user.check_password('valid-student-password-782'))
        self.assertEqual(response.data['user']['role'], 'student')

    def test_registration_rejects_duplicate_email_and_weak_password(self):
        duplicate = self.client.post(
            '/api/accounts/register/',
            {
                'first_name': 'Existing',
                'last_name': 'Student',
                'email': 'STUDENT@test.edu',
                'password': 'valid-student-password-782',
            },
            format='json',
        )
        weak_password = self.client.post(
            '/api/accounts/register/',
            {
                'first_name': 'New',
                'last_name': 'Student',
                'email': 'new.student@test.edu',
                'password': '123',
            },
            format='json',
        )

        self.assertEqual(duplicate.status_code, 400)
        self.assertIn('email', duplicate.data)
        self.assertEqual(weak_password.status_code, 400)
        self.assertIn('password', weak_password.data)
