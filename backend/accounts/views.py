from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.authtoken.models import Token
from rest_framework import viewsets
from .models import TravelPreferences
from .serializers import TravelPreferencesSerializer
from django.contrib.auth import authenticate, get_user_model
from .serializers import CustomUserSerializer
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.forms import PasswordResetForm
from .serializers import PasswordResetSerializer
from django.http import JsonResponse
import json
from django.views import View
from django.contrib.auth.models import User
from django.utils.http import urlsafe_base64_decode

# Get custom user model
User = get_user_model()

# Decode UID and get the user
def get_user(uidb64):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        return User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return None

class AuthenticationStatusView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, *args, **kwargs):
        return Response({"is_authenticated": request.user.is_authenticated})

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
            if user.account_locked_until and timezone.now() < user.account_locked_until:
                return Response({'detail': 'Your account is temporarily locked due to multiple failed login attempts. Please try again later.'}, status=status.HTTP_403_FORBIDDEN)

            authenticated_user = authenticate(username=email, password=password)

            if authenticated_user is not None:
                user.failed_login_attempts = 0
                user.account_locked_until = None
                user.save()
                token, created = Token.objects.get_or_create(user=user)
                return Response({'token': token.key})
            else:
                user.failed_login_attempts += 1
                user.save()

                if user.failed_login_attempts >= 5:
                    user.account_locked_until = timezone.now() + timedelta(minutes=5)
                    user.save()
                    return Response({'detail': 'Your account has been temporarily locked due to multiple failed login attempts. Please try again later.'}, status=status.HTTP_403_FORBIDDEN)

                return Response({'detail': 'Incorrect password. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'detail': 'User with this email does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        user_data = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone_number": user.phone_number,
            "address": user.address,
        }
        return Response(user_data)
    
    def put(self, request, *args, **kwargs):
        user = request.user
        data = request.data['userDetails']

        if "email" in data:
            user.email = data["email"]
        if "first_name" in data:
            user.first_name = data["first_name"]
        if "last_name" in data:
            user.last_name = data["last_name"]
        if "phone_number" in data:  
            user.phone_number = data["phone_number"]
        if "address" in data:       
            user.address = data["address"]

        # Save the updated user object
        user.save()

        return Response({"message": "User profile updated successfully."}, status=status.HTTP_200_OK)

class PasswordResetAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            form = PasswordResetForm({'email': serializer.data['email']})
            if form.is_valid():
                form.save(
                    request=request, 
                    from_email='your-email@example.com',
                    email_template_name='registration/password_reset_email.html',
                    use_https=request.is_secure(),
                    domain_override='localhost:3000'
                )
                return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid email'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomPasswordResetConfirmView(View):
    def post(self, request, *args, **kwargs):
        body_unicode = request.body.decode('utf-8')
        body_data = json.loads(body_unicode)
        new_password = body_data.get('new_password')
        user = get_user(kwargs['uidb64'])

        if not user:
            return JsonResponse({'error': 'Invalid user'}, status=400)
    
        user.set_password(new_password)
        user.save(update_fields=['password'])

        return JsonResponse({'message': 'Password reset successful'}, status=200)
    
    class TravelPreferencesViewSet(viewsets.ModelViewSet):
        permission_classes = [IsAuthenticated]
        serializer_class = TravelPreferencesSerializer

        def get_queryset(self):
            return TravelPreferences.objects.filter(user=self.request.user)

        def perform_create(self, serializer):
            serializer.save(user=self.request.user)

        def perform_update(self, serializer):
            serializer.save(user=self.request.user)
