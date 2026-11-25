from django.db import migrations


def create_default_admin(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    from django.contrib.auth.hashers import make_password

    # Ensure admin user exists with email admin@gmail.com and password admin123
    user = User.objects.filter(email='admin@gmail.com').first()
    if not user:
        user = User.objects.filter(username='admin').first()

    if not user:
        User.objects.create(
            username='admin',
            email='admin@gmail.com',
            password=make_password('admin123'),
            role='ADMIN',
            is_staff=True,
            is_superuser=True,
        )
    else:
        user.username = 'admin'
        user.email = 'admin@gmail.com'
        user.password = make_password('admin123')
        user.role = 'ADMIN'
        user.is_staff = True
        user.is_superuser = True
        user.save()


def reverse_default_admin(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_admin, reverse_default_admin),
    ]
