from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    preferred_language = models.CharField(max_length=50, blank=True, null=True)
    failed_login_attempts = models.IntegerField(default=0)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    travel_preferences = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.email
    
class TravelPreferences(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='travel_preferences_relation')
    destination_type = models.CharField(max_length=100, blank=True, null=True)
    transportation = models.CharField(max_length=100, blank=True, null=True)
    airline = models.CharField(max_length=100, blank=True, null=True)
    seating_class = models.CharField(max_length=100, blank=True, null=True)
    meal = models.CharField(max_length=100, blank=True, null=True)
    activities = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.email}'s Travel Preferences"