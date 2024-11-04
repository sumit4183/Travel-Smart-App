from rest_framework import serializers
from accounts.models import CustomUser

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'first_name', 'last_name', 'email', 'phone_number',
            'address', 'preferred_language', 'travel_preferences'
        ]
