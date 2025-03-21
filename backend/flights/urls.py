from django.urls import path
from .views import FlightSearchView, book_flight, tokenize_payment

urlpatterns = [
    path('search/', FlightSearchView.as_view(), name='flight_search'),
    path('book/', book_flight, name='book_flight'),
    path('payments/tokenize/', tokenize_payment, name='tokenize_payment'),
    # path('upcoming_trips/', get_upcoming_trips, name='get_upcoming_trips'),
]
