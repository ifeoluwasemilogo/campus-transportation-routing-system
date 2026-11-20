from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Create STUDENT and ADMIN groups and assign the required permissions.'

    def handle(self, *args, **options):
        user_model = get_user_model()
        student_group, created_student = Group.objects.get_or_create(name='STUDENT')
        admin_group, created_admin = Group.objects.get_or_create(name='ADMIN')

        if created_student:
            self.stdout.write(self.style.SUCCESS('Created group: STUDENT'))
        else:
            self.stdout.write('Group already exists: STUDENT')

        if created_admin:
            self.stdout.write(self.style.SUCCESS('Created group: ADMIN'))
        else:
            self.stdout.write('Group already exists: ADMIN')

        transport_permissions = Permission.objects.filter(content_type__app_label='transport')
        student_permissions = transport_permissions.filter(codename__startswith='view_')
        student_group.permissions.add(*student_permissions)
        admin_permissions = Permission.objects.filter(content_type__app_label__in=['accounts', 'transport'])
        admin_group.permissions.add(*admin_permissions)

        for user in user_model.objects.filter(role='STUDENT'):
            user.groups.add(student_group)
        for user in user_model.objects.filter(role='ADMIN'):
            user.groups.add(admin_group)

        self.stdout.write(self.style.SUCCESS('Role permissions seeded successfully.'))
