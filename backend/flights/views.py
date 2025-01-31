from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from amadeus import Client, ResponseError
from django.conf import settings
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
    amadeus = Client(
        client_id=settings.AMADEUS_CLIENT_ID,
        client_secret=settings.AMADEUS_CLIENT_SECRET
    )
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)

        # Extract required parameters from frontend request
        departure = data.get("departure")
        arrival = data.get("arrival")
        departure_date = data.get("departureDate")
        arrival_date = data.get("arrivalDate")
        price = data.get("price")
        currency = data.get("currency")
        adults = int(data.get("adults", 1))
        kids = int(data.get("kids", 0))
        travelers = data.get("travelers", [])
        payment_token = data.get("paymentToken")  # Tokenized payment info

        if not departure or not arrival or not departure_date or not price or not currency or not travelers:
            return JsonResponse({"error": "Missing required fields"}, status=400)

# Ensure travelers have the correct format
        # formatted_travelers = [
        #     {
        #         "id": str(i + 1),
        #         "dateOfBirth": traveler["dateOfBirth"],
        #         "name": {
        #             "firstName": traveler["firstName"],
        #             "lastName": traveler["lastName"]
        #         },
        #         "gender": "MALE" if i % 2 == 0 else "FEMALE",
        #         "contact": {
        #             "emailAddress": f"traveler{i+1}@example.com",
        #             "phones": [
        #                 {
        #                     "deviceType": "MOBILE",
        #                     "countryCallingCode": "1",
        #                     "number": "1234567890"
        #                 }
        #             ]
        #         }
        #     }
        #     for i, traveler in enumerate(travelers)
        # ]

        formatted_travelers = [
  {
    "id": "1",
    "dateOfBirth": "1990-01-01",
    "name": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "gender": "MALE",
    "contact": {
      "emailAddress": "john.doe@example.com",
      "phones": [
        {
          "deviceType": "MOBILE",
          "countryCallingCode": "1",
          "number": "1234567890"
        }
      ]
    }
  }
]
        # Construct Amadeus API request payload
        flight_booking_request = {
            "data": {
                "type": "flight-order",
                "flightOffers": [
                    {
                        "type": "flight-offer",
                        "id": "1",
                        "source": "GDS",
                        "instantTicketingRequired": False,
                        "paymentCardRequired": False,
                        "itineraries": [
                            {
                                "segments": [
                                    {
                                        "departure": {
                                            "iataCode": departure,
                                            "at": departure_date
                                        },
                                        "arrival": {
                                            "iataCode": arrival,
                                            "at": arrival_date
                                        },
                                        "carrierCode": "KL",
                                        "number": "123",
                                        "aircraft": {
                                            "code": "777"
                                        },
                                        "operating": {
                                            "carrierCode": "AF"
                                        },
                                        "duration": "PT8H30M",
                                        "id": "1",
                                        "numberOfStops": 0
                                    }
                                ]
                            }
                        ],
                        "price": {
                            "currency": currency,
                            "total": str(price),
                            "base": str(price)
                        },
                        "pricingOptions": {
                            "fareType": ["PUBLISHED"],
                            "includedCheckedBagsOnly": True
                        },
                        "validatingAirlineCodes": ["KL"],
                        "travelerPricings": [
                            {
                                "travelerId": 1,
                                "fareOption": "STANDARD",
                                # "travelerType": "ADULT" if i < adults else "CHILD",
                                "travelerType": "ADULT",
                                "price": {
                                    "currency": currency,
                                    "total": str(price)
                                }
                            }
                            # for i in range(adults + kids)
                        ]
                    }
                ],
                "ticketingAgreement": {
                    "option": "DELAY_TO_CANCEL",
                    "delay": "6D"
                },
                "contacts": [
                    {
                        "addresseeName": {
                            "firstName": "Support",
                            "lastName": "Team"
                        },
                        "companyName": "Travel Agency",
                        "purpose": "STANDARD",
                        "phones": [
                            {
                                "deviceType": "MOBILE",
                                "countryCallingCode": "1",
                                "number": "9876543210"
                            }
                        ],
                        "emailAddress": "support@travelagency.com",
                        "address": {
                            "lines": ["123 Travel St"],
                            "postalCode": "10001",
                            "cityName": "New York",
                            "countryCode": "US"
                        }
                    }
                ]
            }
        }

        # Call Amadeus API
        print(flight_booking_request)
        response = amadeus.booking.flight_orders.post(
            flight_booking_request["data"],
            travelers=formatted_travelers
        )

        return JsonResponse(response.data, safe=False, status=200)

    except ResponseError as error:
        return JsonResponse({"error": str(error)}, status=400)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)
    
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
