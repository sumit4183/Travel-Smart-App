import json
import random
import string
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from amadeus import Client, ResponseError
from django.conf import settings
from .models import FlightSearch
from .serializers import FlightSearchSerializer
from .services import AmadeusService

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
            # Step 1: Confirm flight pricing
            pricing_response = amadeus.shopping.flight_offers.pricing.post(flight)

            if pricing_response.status_code != 200:
                return JsonResponse({"error": "Pricing confirmation failed", "details": pricing_response.body}, status=400)

            confirm_flight = pricing_response.data['flightOffers']

            # Step 2: Proceed with booking
            booking_response = amadeus.booking.flight_orders.post(confirm_flight, traveler)

            if booking_response.status_code == 201:
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