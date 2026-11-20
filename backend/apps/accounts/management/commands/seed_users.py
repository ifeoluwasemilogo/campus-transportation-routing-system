import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create initial student and admin users for development only.'

    def handle(self, *args, **options):
        if settings.DEBUG is False:
            self.stderr.write(self.style.ERROR('Development user seeding is disabled in production.'))
            return

        User = get_user_model()
        student_email = os.getenv('STUDENT_EMAIL', 'student@ui.edu.ng')
        admin_email = os.getenv('ADMIN_EMAIL', 'admin@ui.edu.ng')
        student_password = os.getenv('STUDENT_PASSWORD', 'student123')
        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')

        student_group, _ = Group.objects.get_or_create(name='STUDENT')
        admin_group, _ = Group.objects.get_or_create(name='ADMIN')

        for email, password, group_name in [
            (student_email, student_password, 'STUDENT'),
            (admin_email, admin_password, 'ADMIN'),
        ]:
            user, created = User.objects.get_or_create(email=email, defaults={'username': email})
            if created:
                user.set_password(password)
                user.is_active = True
                user.is_staff = group_name == 'ADMIN'
                user.role = group_name
                user.first_name = 'Ada' if group_name == 'STUDENT' else 'Nora'
                user.last_name = 'Johnson' if group_name == 'STUDENT' else 'Okafor'
                user.save()
                group = student_group if group_name == 'STUDENT' else admin_group
                user.groups.add(group)
                self.stdout.write(self.style.SUCCESS(f'Created {group_name} user: {email}'))
            else:
                user.username = email
                user.role = group_name
                user.is_staff = group_name == 'ADMIN'
                user.first_name = user.first_name or ('Ada' if group_name == 'STUDENT' else 'Nora')
                user.last_name = user.last_name or ('Johnson' if group_name == 'STUDENT' else 'Okafor')
                user.save(update_fields=['username', 'role', 'is_staff', 'first_name', 'last_name'])
                self.stdout.write(f'User already exists: {email}')

        self.stdout.write(self.style.SUCCESS('Seed users completed.'))
