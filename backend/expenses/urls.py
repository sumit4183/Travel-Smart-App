from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, ExpenseViewSet, FlightViewSet, HotelViewSet

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'flights', FlightViewSet, basename='flight')
router.register(r'hotels', HotelViewSet, basename='hotel')

urlpatterns = [
    path('', include(router.urls)),
]
