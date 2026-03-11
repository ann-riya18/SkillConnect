from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(write_only=True)
    username = None  # Remove username field requirement

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove username from required fields
        if 'username' in self.fields:
            del self.fields['username']

    def validate(self, attrs):
        email = (attrs.get("email") or "").lower().strip()
        password = attrs.get("password") or ""

        if not email or not password:
            raise serializers.ValidationError({"detail": "Email and password are required"})

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "Invalid email or password"})

        if not user.check_password(password):
            raise serializers.ValidationError({"detail": "Invalid email or password"})

        # Generate token using username internally
        data = super().validate({"username": user.username, "password": password})
        return data
