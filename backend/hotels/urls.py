from django.urls import path
from . import views

app_name = 'hotels'

urlpatterns = [
    # Step 1: Hotel List API endpoints
    path('list/', views.list_hotels, name='list_hotels'),
    
    # Step 2: Hotel Search API endpoints
    path('offers/', views.search_hotel_offers, name='search_hotel_offers'),
    path('offers/<str:offer_id>/', views.get_offer_details, name='get_offer_details'),
    
    # Step 3: Hotel Booking API endpoint
    path('book/', views.book_hotel, name='book_hotel'),
    
    # Additional endpoints for saved searches and bookings
    path('saved-searches/', views.saved_searches, name='saved_searches'),
    path('bookings/', views.user_bookings, name='user_bookings'),
]