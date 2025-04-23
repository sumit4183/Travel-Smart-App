from django.contrib import admin
from .models import Trip, Expense

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('name', 'destination', 'user', 'budget', 'start_date', 'end_date')
    search_fields = ('name', 'destination', 'user__email')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('trip', 'amount', 'currency', 'category', 'date')
    search_fields = ('trip__name', 'category')
