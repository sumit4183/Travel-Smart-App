from django.conf import settings
from django.db import models


class FlightSearch(models.Model):
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    departure_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    passengers = models.PositiveIntegerField()
    cabin_class = models.CharField(max_length=20, default='economy')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.origin} to {self.destination} on {self.departure_date}"

class Booking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    departure = models.CharField(max_length=50)
    arrival = models.CharField(max_length=50)
    departure_date = models.DateField()
    arrival_date = models.DateField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=5)
    travelers = models.JSONField()  # Store traveler details as JSON
    booking_reference = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, default="confirmed")  # Confirmed, Cancelled, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    carrier_code = models.CharField(max_length=5, default='AAAA')
    flight_number = models.CharField(max_length=5)

    def __str__(self):
        return f"Booking {self.booking_reference} - {self.user.username}"