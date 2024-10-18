from django.urls import path
from .views import CustomUserRegistrationView

urlpatterns = [
    path('registration/', CustomUserRegistrationView.as_view(), name='custom_registration'),
]
