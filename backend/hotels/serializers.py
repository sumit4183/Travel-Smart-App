from rest_framework import serializers
from .models import HotelSearch, HotelBooking, HotelGuest

class HotelSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelSearch
        fields = '__all__'
        read_only_fields = ('user', 'created_at')
    
    def create(self, validated_data):
        # Associate the search with the current user if authenticated
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)

class HotelGuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelGuest
        fields = ('title', 'first_name', 'last_name', 'email', 'phone', 'is_lead_guest')

class HotelBookingSerializer(serializers.ModelSerializer):
    guests = HotelGuestSerializer(many=True, read_only=True)
    
    class Meta:
        model = HotelBooking
        fields = '__all__'
        read_only_fields = ('user', 'booking_id', 'provider_confirmation_id', 'status', 
                           'booking_data', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        # Associate the booking with the current user
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)