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
