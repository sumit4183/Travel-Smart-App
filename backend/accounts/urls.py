from django.urls import path
from .views import CustomUserRegistrationView, CustomUserLoginView, UserProfileView, AuthenticationStatusView
from django.contrib.auth import views as auth_views
from .csrf_view import csrf_token_view  
from .views import PasswordResetAPIView, CustomPasswordResetConfirmView

urlpatterns = [
    path('registration/', CustomUserRegistrationView.as_view(), name='custom_registration'),
    path('reset_password/', auth_views.PasswordResetView.as_view(), name='reset_password'),
    path('reset_password_sent/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset_password_complete/', auth_views.PasswordResetCompleteView.as_view(), name="password_reset_complete"),
    path('api/csrf/', csrf_token_view, name='csrf_token_view'),
    path('api/password_reset/', PasswordResetAPIView.as_view(), name='password_reset_api'),
    path('api/reset/<uidb64>/<token>/', CustomPasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('login/', CustomUserLoginView.as_view(), name='custom_login'),
    path('auth/user/', UserProfileView.as_view(), name='user_profile'),
    path('status/', AuthenticationStatusView.as_view(), name='auth_status'),
]
