from django.urls import path
from .import views

urlpatterns = [
    path('passwordReset/', views.passwordReset, name="resetView"),
    path('linkReset/', views.index, name="linkView")
]