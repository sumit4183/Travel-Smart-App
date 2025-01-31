from django.urls import path
from .views import search_flights, get_airports, book_flight, tokenize_payment

urlpatterns = [
    path('search/', search_flights, name='search_flights'),
    path('airports/', get_airports, name='get_airports'),
    path('book/', book_flight, name='book_flight'),
    path('payments/tokenize/', tokenize_payment, name='tokenize_payment'),
]