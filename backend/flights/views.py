from django.http import JsonResponse
from amadeus import Client, ResponseError
from django.conf import settings

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

    print(origin)
    print(destination)
    print(type(departure_date))
    print(type(return_date))
    print(adults)

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