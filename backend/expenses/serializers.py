from rest_framework import serializers
from .models import Trip, Expense, Flight, Hotel

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']

class FlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flight
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class TripSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.id')
    expenses = ExpenseSerializer(many=True, read_only=True)
    flights = FlightSerializer(many=True, read_only=True)
    hotels = HotelSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'expenses', 'flights', 'hotels']