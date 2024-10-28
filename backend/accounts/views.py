from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, get_user_model
from rest_framework.permissions import AllowAny
from .serializers import CustomUserSerializer
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class CustomUserRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomUserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        user = User.objects.filter(email=email).first()

        if user is not None:
            # Check if the account is locked
            if user.account_locked_until and timezone.now() < user.account_locked_until:
                return Response({'detail': 'Your account is temporarily locked due to multiple failed login attempts. Please try again later.'}, status=status.HTTP_403_FORBIDDEN)

            # Authenticate user
            authenticated_user = authenticate(username=email, password=password)

            if authenticated_user is not None:
                # Reset failed login attempts on successful login
                user.failed_login_attempts = 0
                user.account_locked_until = None
                user.save()

                token, created = Token.objects.get_or_create(user=user)
                return Response({'token': token.key})
            else:
                # Increment failed login attempts
                user.failed_login_attempts += 1
                user.save()

                # Lock the account after 5 failed attempts
                if user.failed_login_attempts >= 5:
                    user.account_locked_until = timezone.now() + timedelta(minutes=5)  # Lock for 5 minutes
                    user.save()
                    return Response({'detail': 'Your account has been temporarily locked due to multiple failed login attempts. Please try again later.'}, status=status.HTTP_403_FORBIDDEN)

                return Response({'detail': 'Incorrect password. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'detail': 'User with this email does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]  # Require authentication

    def get(self, request, *args, **kwargs):
        user = request.user
        user_data = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
        return Response(user_data)
