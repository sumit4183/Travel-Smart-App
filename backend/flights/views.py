from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from amadeus import Client, ResponseError
from django.conf import settings
from django.utils.crypto import get_random_string
from .models import Booking
from django.contrib.auth.decorators import login_required 
import json
import hashlib
import random
import string

def search_flights(request):
    amadeus = Client(
        client_id=settings.AMADEUS_CLIENT_ID,
        client_secret=settings.AMADEUS_CLIENT_SECRET
    )

    origin = request.GET.get('origin')
    destination = request.GET.get('destination')
    departure_date = request.GET.get('departure_date')
    return_date = request.GET.get('return_date')
    adults = request.GET.get('adults', 1)

    try:
        response = amadeus.shopping.flight_offers_search.get(
            originLocationCode=origin,
            destinationLocationCode=destination,
            departureDate=departure_date,
            returnDate=return_date,
            adults=adults,
        )
        print(response)
        return JsonResponse(response.data, safe=False)
    except ResponseError as error:
        print("Error Details:", error.response.body)
        return JsonResponse({'error': str(error)}, status=500)
 
def get_airports(request):
    amadeus = Client(
        client_id=settings.AMADEUS_CLIENT_ID,
        client_secret=settings.AMADEUS_CLIENT_SECRET
    )
    keyword = request.GET.get('keyword', '')
    try:
        response = amadeus.reference_data.locations.get(
            keyword=keyword,
            subType='AIRPORT'
        )
        return JsonResponse(response.data, safe=False)
    except ResponseError as error:
        return JsonResponse({'error': str(error)}, status=500)



@csrf_exempt 
def book_flight(request):
    print("Book flight")

    amadeus = Client(
        client_id=settings.AMADEUS_CLIENT_ID,
        client_secret=settings.AMADEUS_CLIENT_SECRET
    )
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            flight = data.get("flight")  
            traveler = data.get("traveler")
            
            # Step 1: Confirm flight pricing
            pricing_response = amadeus.shopping.flight_offers.pricing.post(flight)

            if pricing_response.status_code != 200:
                return JsonResponse({"error": "Pricing confirmation failed", "details": pricing_response.body}, status=400)

            confirm_flight = pricing_response.data['flightOffers']

            # Step 2: Proceed with booking
            booking_response = amadeus.booking.flight_orders.post(confirm_flight, traveler)

            if booking_response.status_code == 201:
                print(booking_response.data)
                return JsonResponse(booking_response.data, status=201)
            return JsonResponse({"error": "Booking failed", "details": booking_response.body}, status=400)
        except (ResponseError, KeyError, AttributeError) as error:
            return JsonResponse({"error": str(error)}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)

    
@csrf_exempt
def tokenize_payment(request):
    """
    Tokenizes payment details instead of storing them.
    This should be replaced with an actual payment provider like Stripe or PayPal in production.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)
        card_number = data.get("cardNumber")
        expiry_date = data.get("expiryDate")
        cvv = data.get("cvv")

        if not card_number or not expiry_date or not cvv:
            return JsonResponse({"error": "Missing payment fields"}, status=400)

        # Simulate tokenization by hashing the card details (in real-world, use a payment gateway)
        token = "tok_" + ''.join(random.choices(string.ascii_letters + string.digits, k=16))

        return JsonResponse({"token": token}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)

@login_required
def get_upcoming_trips(request):
    upcoming_trips = Booking.objects.filter(user=request.user, status="confirmed").order_by("departure_date")
    
    trip_data = [
        {
            "departure": trip.departure,
            "arrival": trip.arrival,
            "departure_date": trip.departure_date.strftime("%Y-%m-%d"),
            "arrival_date": trip.arrival_date.strftime("%Y-%m-%d") if trip.arrival_date else None,
            "price": str(trip.price),
            "currency": trip.currency,
            "booking_reference": trip.booking_reference
        }
        for trip in upcoming_trips
    ]

    return JsonResponse({"upcomingTrips": trip_data}, status=200)