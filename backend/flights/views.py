import json
import random
import string
from django.db import IntegrityError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from amadeus import Client, ResponseError
from django.conf import settings
from django.contrib.auth.decorators import login_required 

from .models import FlightSearch, Booking
from .serializers import FlightSearchSerializer
from .services import AmadeusService
from django.contrib.auth import get_user_model

User = get_user_model()

class FlightSearchView(APIView):
    ermission_classes = [AllowAny]  


    def post(self, request):
        serializer = FlightSearchSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            try:
                amadeus = AmadeusService()
                flights = amadeus.search_flights(
                    origin=data['origin'],
                    destination=data['destination'],
                    departure_date=data['departure_date'].strftime('%Y-%m-%d'),
                    return_date=data['return_date'].strftime('%Y-%m-%d') if data.get('return_date') else None,
                    passengers=data['passengers'],
                    cabin_class=data['cabin_class']
                )
                
                # Save the search
                serializer.save()
                
                return Response({
                    'flights': flights,
                    'search_id': serializer.instance.id
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@csrf_exempt 
def book_flight(request):

    amadeus = Client(
        client_id=settings.AMADEUS_API_KEY,
        client_secret=settings.AMADEUS_API_SECRET
    )
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            flight = data.get("flight")  
            traveler = data.get("traveler")
            userID = data.get("userID")
            # Step 1: Confirm flight pricing
            pricing_response = amadeus.shopping.flight_offers.pricing.post(flight)

            if pricing_response.status_code != 200:
                return JsonResponse({"error": "Pricing confirmation failed", "details": pricing_response.body}, status=400)

            confirm_flight = pricing_response.data['flightOffers']

            # Step 2: Proceed with booking
            booking_response = amadeus.booking.flight_orders.post(confirm_flight, traveler)

            if booking_response.status_code == 201:
                booking_data = booking_response.data
                # Extract booking details
                flight_offer = booking_data['flightOffers'][0]
                booking_reference = booking_data['associatedRecords'][0]['reference']
                departure = flight_offer['itineraries'][0]['segments'][0]['departure']['iataCode']
                arrival = flight_offer['itineraries'][0]['segments'][-1]['arrival']['iataCode']
                departure_date = flight_offer['itineraries'][0]['segments'][0]['departure']['at'].split("T")[0]
                arrival_date = flight_offer['itineraries'][0]['segments'][-1]['arrival']['at'].split("T")[0]
                price = float(flight_offer['price']['grandTotal'])
                currency = flight_offer['price']['currency']
                # Save to Booking model
                try:
                    user = User.objects.get(id=userID)
                    Booking.objects.create(
                        user=user,
                        departure=departure,
                        arrival=arrival,
                        departure_date=departure_date,
                        arrival_date=arrival_date,
                        price=price,
                        currency=currency,
                        travelers=traveler,
                        booking_reference=booking_reference,
                        status="confirmed"
                    )
                    print("Booking saved successfully") 
                    return JsonResponse(booking_response.data, status=201) 
                except User.DoesNotExist:
                    return JsonResponse({"error": "User not found"}, status=404)
                except IntegrityError as e:
                    print("database integrity errror")
                except Exception as e:
                    print("An error occurred")
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

@csrf_exempt    
def get_upcoming_trips(request):
    try:
        # Ensure the user is authenticated
        data = json.loads(request.body)
        user = data.get("user")  
        # if not user.is_authenticated:
        #     return JsonResponse({"error": "User is not authenticated"}, status=401)

        # Filter bookings for the authenticated user
        upcoming_trips = Booking.objects.filter(
            user_id=user["id"],
            status="confirmed"
        ).order_by("departure_date")

        # Format trip data
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

    except Exception as e:
        print(e)
        return JsonResponse({"error": str(e)}, status=500)