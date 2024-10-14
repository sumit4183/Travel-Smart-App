import json, psycopg2, secrets
from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from datetime import timedelta
from database.db_conn import param 

# import database.db_conn as db

# represent the main page
def index(request):
    data = {'email': request.GET.get("email", None)}
    return render(request, 'backend/index.html', data)

def generate_reset_token():
    return secrets.token_urlsafe(32)

# Save the token to the database
def save_reset_token(email, token):
    try:
        with psycopg2.connect(**param) as conn:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO password_reset_tokens (email, token) VALUES (%s, %s) ON CONFLICT (email) DO UPDATE SET token = EXCLUDED.token, created_at = CURRENT_TIMESTAMP;",
                            (email, token))
                conn.commit()
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return False
    return True


@require_http_methods(["POST"])
def passwordReset(request):
    try:
        
        body = request.body.decode('utf-8')
        data = json.loads(body)

        # retrieve username and password
        uname = data.get('email')
        pwd = data.get('password')

        if not uname or not pwd:
            return HttpResponse({'error': 'Email and password are required'}, status=400)
        
        # Generate a reset token
        token = generate_reset_token()
        
        # result = db.reset_password(username, password)
        # if result == True:
        #     return HttpResponse("Password Reset Successful!")
        # else:
        #     return HttpResponse("User not exist!")

    except json.JSONDecodeError:
        return HttpResponse("Invalid JSON format", status=400)
    

def validate_reset_token(token):
    try:
        with psycopg2.connect(**param) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT email, created_at FROM password_reset_tokens WHERE token = %s", (token,))
                result = cur.fetchone()

                if result is None:
                    return False, "Invalid token"

                email, created_at = result
                token_expiry_time = created_at + timedelta(hours=1)  # valid for 1 hour
                if timezone.now() > token_expiry_time:
                    return False, "Token expired!"

                return True, email

    except psycopg2.Error as e:
        return False, "Database error"

# Validate the token and show the reset form
def validate_token_view(request):
    token = request.GET.get('token')
    if not token:
        return HttpResponse("Token is required", status=400)

    is_valid, email_or_error = validate_reset_token(token)
    if not is_valid:
        return HttpResponse(email_or_error, status=400)

    # If valid, allow the user to reset their password (render a form or accept new password)
    return HttpResponse(f"Token is valid for {email_or_error}", status=200)