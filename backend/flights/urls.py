from django.urls import path
from .views import search_flights, get_airports

urlpatterns = [
    path('search/', search_flights, name='search_flights'),
    path('airports/', get_airports, name='get_airports'),
]