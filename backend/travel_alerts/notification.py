from django.core.mail import send_mail, BadHeaderError
import traceback

def send_flight_alert(user, message):
    try:
        print(f"Trying to send email to: {user.email}")
        send_mail(
            subject="✈️ Flight Alert",
            message=message,
            from_email="alerts@yourapp.com",  # hardcoding this for now
            recipient_list=[user.email],
            fail_silently=False, 
        )
        print("Email sent.")
    except Exception as e:
        print("Email failed to send.")
        traceback.print_exc()