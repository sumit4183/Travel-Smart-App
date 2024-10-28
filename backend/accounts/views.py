from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny 
from .serializers import CustomUserSerializer
from django.contrib.auth.forms import PasswordResetForm
from .serializers import PasswordResetSerializer
from django.contrib.auth import get_user_model
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


class CustomUserRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetAPIView(APIView):
    permission_classes = [AllowAny]

    # Handle POST request for initiating a password reset
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            form = PasswordResetForm({'email': serializer.data['email']})
            if form.is_valid():
                 # Send password reset email with a link
                form.save(
                    request=request, 
                    from_email='your-email@example.com',
                    email_template_name='registration/password_reset_email.html',
                    use_https=request.is_secure(),
                    domain_override='localhost:3000'    # replaced for local testing
                )
                return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid email'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# View for confirming the password reset and setting a new password
class CustomPasswordResetConfirmView(View):
    def post(self, request, *args, **kwargs):
        body_unicode = request.body.decode('utf-8')
        body_data = json.loads(body_unicode)

        # Get the email from the body data
        new_password = body_data.get('new_password')
        user = get_user(kwargs['uidb64'])

        if not user:
            return JsonResponse({'error': 'Invalid user'}, status=400)
    
        user.set_password(new_password)
        user.save(update_fields=['password'])

        return JsonResponse({'message': 'Password reset successful'}, status=200)