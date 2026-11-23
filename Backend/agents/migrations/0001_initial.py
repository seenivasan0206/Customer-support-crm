

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Agent',
            fields=[
                ('agent_id', models.AutoField(primary_key=True, serialize=False)),
                ('full_name', models.CharField(max_length=150)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('phone_number', models.CharField(blank=True, max_length=15)),
                ('department', models.CharField(default='Customer Support', max_length=100)),
                ('status', models.CharField(choices=[('AVAILABLE', 'Available'), ('BUSY', 'Busy'), ('INACTIVE', 'Inactive')], default='AVAILABLE', max_length=20)),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'agents_agent',
                'ordering': ['full_name'],
            },
        ),
    ]
