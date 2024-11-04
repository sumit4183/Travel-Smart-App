from django.urls import path
from .views import UserProfileDetailView

urlpatterns = [
    path('user/', UserProfileDetailView.as_view(), name='user-profile'),
]
