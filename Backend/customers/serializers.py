from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = ("customer_id", "registration_date", "updated_at")

    def validate_full_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Customer name cannot be empty.")
        return value

    def validate_email(self, value):
        value = value.strip().lower()
        qs = Customer.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This email is already registered.")
        return value
