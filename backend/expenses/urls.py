from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, ExpenseViewSet

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'expenses', ExpenseViewSet, basename='expense')

urlpatterns = [
    path('', include(router.urls)),
]
