from django.db import models

class Report(models.Model):
    REPORT_TYPES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('custom', 'Custom'),
    ]

    title = models.CharField(max_length=200)
    report_type = models.CharField(
        max_length=20,
        choices=REPORT_TYPES,
        default='daily'
    )
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

