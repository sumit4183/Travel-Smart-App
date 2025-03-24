from django.urls import path
from .views import TripListCreateView, ExpenseListCreateView, trip_summary

urlpatterns = [
    path('trips/', TripListCreateView.as_view(), name='trip-list-create'),
    path('expenses/', ExpenseListCreateView.as_view(), name='expense-list-create'),
    path('trips/<int:trip_id>/summary/', trip_summary, name='trip-summary'),
]
