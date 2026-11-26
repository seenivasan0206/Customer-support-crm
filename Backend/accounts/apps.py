from django.apps import AppConfig
from django.db.models.signals import post_migrate


def init_default_admin(sender, **kwargs):
    # Only run for accounts app migrations
    if sender.name != 'accounts':
        return

    from django.contrib.auth import get_user_model
    from django.contrib.auth.hashers import make_password

    User = get_user_model()
    try:
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
                is_superuser=True
            )
        else:
            user.username = 'admin'
            user.email = 'admin@gmail.com'
            user.password = make_password('admin123')
            user.role = 'ADMIN'
            user.is_staff = True
            user.is_superuser = True
            user.save()
    except Exception:
        pass


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        post_migrate.connect(init_default_admin, sender=self)
