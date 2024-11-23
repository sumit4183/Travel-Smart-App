from rest_framework import serializers
from .models import CustomUser
from .models import TravelPreferences

class CustomUserSerializer(serializers.ModelSerializer):
  password1 = serializers.CharField(write_only=True)
  password2 = serializers.CharField(write_only=True)

  class Meta:
    model = CustomUser
    fields = [
        'id', 'username', 'email', 'password1', 'password2', 'first_name', 'last_name',
        'phone_number', 'date_of_birth', 'address', 'preferred_language', 'travel_preferences'
    ]

  def validate(self, data):
    if data['password1'] != data['password2']:
        raise serializers.ValidationError("Passwords do not match.")
    return data

  def create(self, validated_data):
    user = CustomUser.objects.create_user(
      username=validated_data['username'],
      email=validated_data['email'],
      password=validated_data['password1'],  # Use password1 here
      first_name=validated_data.get('first_name', ''),
      last_name=validated_data.get('last_name', ''),
      date_of_birth=validated_data.get('date_of_birth', None),
      preferred_language=validated_data.get('preferred_language', ''),
      travel_preferences=validated_data.get('travel_preferences', '')
    )
    return user

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

class TravelPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelPreferences
        fields = ['destination_type', 'transportation', 'airline', 'seating_class', 'meal', 'activities']