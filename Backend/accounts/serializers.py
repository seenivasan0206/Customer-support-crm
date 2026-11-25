from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


# 1. User Profile Serializer (Returns user profile details)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone', 'date_joined')


# 2. User Registration Serializer (Handles validation and secure password hashing)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'phone')

    def create(self, validated_data):
        # Uses create_user to cryptographically hash the password (PBKDF2-SHA256)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'CUSTOMER'),
            phone=validated_data.get('phone', None)
        )
        return user


# 3. Custom Login Serializer (Includes tokens along with user info and role in login response)
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Allow authentication with either username or email address
        username_or_email = attrs.get('username')
        if username_or_email and '@' in username_or_email:
            try:
                user = User.objects.get(email__iexact=username_or_email)
                attrs['username'] = user.username
            except User.DoesNotExist:
                pass

        data = super().validate(attrs)

        # Attach additional user profile data to the login response payload
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
        }
        return data
