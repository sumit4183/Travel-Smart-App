from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import Trip, Expense
from .serializers import TripSerializer, ExpenseSerializer

# Trip list/create
class TripListCreateView(generics.ListCreateAPIView):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Expense list/create
class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(trip__user=self.request.user)

    def perform_create(self, serializer):
        trip = serializer.validated_data['trip']
        if trip.user != self.request.user:
            raise PermissionDenied("You don't own this trip.")
        serializer.save()

# Summary API for a trip
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def trip_summary(request, trip_id):
    trip = Trip.objects.get(id=trip_id, user=request.user)
    expenses = trip.expenses.all()

    total_spent = sum(e.amount for e in expenses)
    category_breakdown = {}

    for e in expenses:
        category_breakdown[e.category] = category_breakdown.get(e.category, 0) + float(e.amount)

    return Response({
        "trip": trip.name,
        "budget": float(trip.budget),
        "total_spent": float(total_spent),
        "remaining": float(trip.budget) - float(total_spent),
        "category_breakdown": {k: float(v) for k, v in category_breakdown.items()}
    })
