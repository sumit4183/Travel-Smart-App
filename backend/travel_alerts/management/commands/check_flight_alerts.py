from django.core.management.base import BaseCommand
from django.utils import timezone
from flights.models import Booking
from amadeus import Client, ResponseError
from django.conf import settings
from amadeus import ResponseError
from travel_alerts.notification import send_flight_alert

class Command(BaseCommand):
    help = "Checks Amadeus flight status and sends alerts"

    def handle(self, *args, **kwargs):
        amadeus = Client(
        client_id=settings.AMADEUS_API_KEY,
        client_secret=settings.AMADEUS_API_SECRET
        )

        today = timezone.now().date()
        bookings = Booking.objects.filter(departure_date__gte=today, status="confirmed")

        for booking in bookings:
            try:
                carrier_code = booking.carrier_code 
                flight_number = booking.flight_number 
                departure_date = booking.departure_date.strftime("%Y-%m-%d")
                response = amadeus.travel.predictions.flight_delay.get(
                    originLocationCode='LAX',
                    destinationLocationCode='JFK',
                    departureDate='2025-06-23',
                    departureTime='21:20:00',
                    arrivalDate='2025-06-24',
                    arrivalTime='06:00:00',
                    aircraftCode='32Q',
                    carrierCode='F9',
                    flightNumber='2504',
                    duration='PT5H40M')
                
                predictions = response.data
                most_likely = max(predictions, key=lambda x: float(x['probability']))
                delay_band = most_likely["result"]
                probability = float(most_likely["probability"])

                if delay_band in ["BETWEEN_60_AND_120_MINUTES", "OVER_120_MINUTES_OR_CANCELLED"] and probability > 0.3:
                    message = (
                        f"⚠️ Predicted delay for flight {booking.flight_number} on {departure_date}:\n"
                        f"{delay_band.replace('_', ' ').title()} (Risk: {round(probability * 100)}%)"
                    )
                    send_flight_alert(booking.user, message)
            except ResponseError as e:
                print(f"Amadeus error: {str(e)}")
            except Exception as e:
                print(f"Failed to check {booking.flight_number}: {e}")
