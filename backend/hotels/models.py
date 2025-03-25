from django.db import models
from django.conf import settings

class HotelSearch(models.Model):
    """Model to store hotel search parameters and history."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='hotel_searches',
        null=True,  # Allow anonymous searches
        blank=True
    )
    city_code = models.CharField(max_length=10, null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    adults = models.PositiveIntegerField(default=1)
    rooms = models.PositiveIntegerField(default=1)
    ratings = models.CharField(max_length=10, null=True, blank=True)
    price_range = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        location = self.city_code or f"{self.latitude},{self.longitude}"
        return f"Search for {location} ({self.check_in_date} to {self.check_out_date})"

class HotelBooking(models.Model):
    """Model to store hotel booking information."""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='hotel_bookings'
    )
    booking_id = models.CharField(max_length=100, unique=True)
    provider_confirmation_id = models.CharField(max_length=100, null=True, blank=True)
    hotel_id = models.CharField(max_length=100)
    hotel_name = models.CharField(max_length=255)
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    number_of_guests = models.PositiveIntegerField()
    room_type = models.CharField(max_length=100)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    booking_data = models.JSONField(null=True, blank=True)  # Store the full booking response
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Booking {self.booking_id} - {self.hotel_name}"

class HotelGuest(models.Model):
    """Model to store guest information for hotel bookings."""
    booking = models.ForeignKey(
        HotelBooking, 
        on_delete=models.CASCADE, 
        related_name='guests'
    )
    title = models.CharField(max_length=10)  # Mr, Mrs, Ms, etc.
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, null=True, blank=True)
    is_lead_guest = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"