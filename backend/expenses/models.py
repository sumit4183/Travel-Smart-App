from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Trip(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="trips")
    name = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} ({self.destination})"


class Expense(models.Model):
    CATEGORY_CHOICES = [
        ("Flights", "Flights"),
        ("Hotels", "Hotels"),
        ("Food", "Food"),
        ("Transport", "Transport"),
        ("Shopping", "Shopping"),
        ("Misc", "Miscellaneous"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="expenses")
    title = models.CharField(max_length=100, default="Untitled")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    note = models.TextField(blank=True)
    date = models.DateField()

    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.amount} {self.currency} on {self.date}"
    
    # def __str__(self):
    #     return f"{self.title} - ${self.amount}"

class Flight(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="flights")
    airline = models.CharField(max_length=100)
    flight_number = models.CharField(max_length=50)
    departure_airport = models.CharField(max_length=100)
    arrival_airport = models.CharField(max_length=100)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.airline} {self.flight_number} ({self.departure_airport} → {self.arrival_airport})"


class Hotel(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="hotels")
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    check_in = models.DateField()
    check_out = models.DateField()
    confirmation_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.location})"