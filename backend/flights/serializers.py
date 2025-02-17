from rest_framework import serializers
from .models import FlightSearch

class FlightSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlightSearch
        fields = '__all__'
