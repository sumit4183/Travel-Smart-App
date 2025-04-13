from rest_framework import serializers
from .models import Trip, Expense

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']

class TripSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.id')
    
    expenses = ExpenseSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'expenses']
