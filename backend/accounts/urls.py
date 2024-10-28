from django.urls import path
from .views import CustomUserRegistrationView
from django.contrib.auth import views as auth_views
from .csrf_view import csrf_token_view  
from .views import PasswordResetAPIView
from .views import CustomPasswordResetConfirmView


urlpatterns = [
    path('registration/', CustomUserRegistrationView.as_view(), name='custom_registration'),

    path('reset_password/', auth_views.PasswordResetView.as_view(), name='reset_password'),
    path('reset_password_sent/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset_password_complete/', auth_views.PasswordResetCompleteView.as_view(), name="password_reset_complete"),

    path('api/csrf/', csrf_token_view, name='csrf_token_view'),
    path('api/password_reset/', PasswordResetAPIView.as_view(), name='password_reset_api'),
    path('api/reset/<uidb64>/<token>/',CustomPasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]
