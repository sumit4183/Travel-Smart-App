from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    preferred_language = models.CharField(max_length=50, blank=True, null=True)
    travel_preferences = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.email
