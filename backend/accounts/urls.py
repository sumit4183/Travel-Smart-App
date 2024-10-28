from django.urls import path
from .views import CustomUserRegistrationView, CustomUserLoginView, UserProfileView

urlpatterns = [
    path('registration/', CustomUserRegistrationView.as_view(), name='custom_registration'),
    path('login/', CustomUserLoginView.as_view(), name='custom_login'),
    path('auth/user/', UserProfileView.as_view(), name='user_profile'),
]