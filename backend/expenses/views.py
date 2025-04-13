from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied

from .models import Trip, Expense
from .serializers import TripSerializer, ExpenseSerializer

class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'], url_path='expenses')
    def list_expenses(self, request, pk=None):
        trip = self.get_object()
        expenses = trip.expenses.all()
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='summary')
    def trip_summary(self, request, pk=None):
        trip = self.get_object()
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
            "category_breakdown": {k: round(v, 2) for k, v in category_breakdown.items()}
        })

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        trip = serializer.validated_data.get('trip')
        if trip.user != self.request.user:
            raise PermissionDenied("You don't own this trip.")
        serializer.save(user=self.request.user)
