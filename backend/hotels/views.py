from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import HotelSearch, HotelBooking
from .serializers import HotelSearchSerializer, HotelBookingSerializer
from .services import AmadeusHotelService
from django.contrib.auth import get_user_model
from django.db import IntegrityError
import uuid

User = get_user_model()

@api_view(['GET'])
def list_hotels(request):
    """Get a list of hotels based on city code or geocode."""
    city_code = request.query_params.get('city_code')
    latitude = request.query_params.get('latitude')
    longitude = request.query_params.get('longitude')
    radius = request.query_params.get('radius')
    chain_codes = request.query_params.get('chain_codes')
    amenities = request.query_params.get('amenities')
    ratings = request.query_params.get('ratings')
    
    if not (city_code or (latitude and longitude)):
        return Response(
            {'error': 'Either city_code or latitude and longitude are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        hotel_service = AmadeusHotelService()
        
        if city_code:
            # Search hotels by city
            hotels_data = hotel_service.get_hotels_by_city(
                city_code=city_code,
                radius=radius,
                chain_codes=chain_codes,
                amenities=amenities,
                ratings=ratings
            )
        else:
            # Search hotels by geocode
            hotels_data = hotel_service.get_hotels_by_geocode(
                latitude=latitude,
                longitude=longitude,
                radius=radius,
                chain_codes=chain_codes,
                amenities=amenities,
                ratings=ratings
            )
        
        formatted_hotels = hotel_service.format_hotel_list(hotels_data)
        return Response({'hotels': formatted_hotels})
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def search_hotel_offers(request):
    """Search for hotel offers with pricing and availability."""
    hotel_ids = request.query_params.get('hotel_ids')
    city_code = request.query_params.get('city_code')
    check_in_date = request.query_params.get('check_in_date')
    check_out_date = request.query_params.get('check_out_date')
    adults = request.query_params.get('adults', 1)
    rooms = request.query_params.get('rooms', 1)
    price_range = request.query_params.get('price_range')
    
    if not (hotel_ids or city_code):
        return Response(
            {'error': 'Either hotel_ids or city_code is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not (check_in_date and check_out_date):
        return Response(
            {'error': 'Check-in and check-out dates are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        hotel_service = AmadeusHotelService()
        
        # Split hotel_ids if it's a comma-separated string
        if hotel_ids and isinstance(hotel_ids, str):
            hotel_ids = hotel_ids.split(',')
        
        offers_data = hotel_service.search_hotel_offers(
            hotel_ids=hotel_ids,
            city_code=city_code,
            check_in_date=check_in_date,
            check_out_date=check_out_date,
            adults=adults,
            rooms=rooms,
            price_range=price_range
        )
        
        formatted_offers = hotel_service.format_hotel_offers(offers_data)
        return Response({'offers': formatted_offers})
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_offer_details(request, offer_id):
    """Get detailed information about a specific hotel offer."""
    try:
        hotel_service = AmadeusHotelService()
        offer_data = hotel_service.get_hotel_offer_details(offer_id)
        return Response({'offer': offer_data})
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def book_hotel(request):
    data = request.data.get('data', {})
    offer_id = data.get('offerId')
    guests = data.get('guests')
    payments = data.get('payments')
    rooms = data.get("rooms", [])

    if not all([offer_id, guests, payments, rooms]):
        return Response({'error': 'Offer ID, guest info, payment, and room info are required'}, 
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        hotel_service = AmadeusHotelService()
        booking_data = hotel_service.book_hotel(offer_id, guests, payments, rooms)
        formatted = hotel_service.format_booking_confirmation(booking_data)

        # Create booking record
        booking = HotelBooking.objects.create(
            booking_id=str(uuid.uuid4()),
            provider_confirmation_id=formatted.get('providerConfirmationId', ''),
            hotel_id=offer_id,
            hotel_name=formatted.get('hotel', ''),
            check_in_date=formatted.get('check_in'),
            check_out_date=formatted.get('check_out'),
            number_of_guests=len(guests),
            room_type=formatted.get('room_type', 'Standard'),
            total_price=formatted.get('price', {}).get('total', 0),
            currency=formatted.get('price', {}).get('currency', 'USD'),
            status=formatted.get('status', 'confirmed'),
            booking_data=booking_data,
            user_id=request.user.id if request.user.is_authenticated else None
        )

        # Create guest records
        for guest in guests:
            HotelGuest.objects.create(
                booking=booking,
                title=guest.get('name', {}).get('title', ''),
                first_name=guest.get('name', {}).get('firstName', ''),
                last_name=guest.get('name', {}).get('lastName', ''),
                email=guest.get('contact', {}).get('email', ''),
                phone=guest.get('contact', {}).get('phone', ''),
                is_lead_guest=(guest == guests[0])
            )

        return Response({'booking': formatted})

    except Exception as e:
        print(f"Error during booking: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def saved_searches(request):
    """Get or save hotel searches for the authenticated user."""
    if request.method == 'GET':
        searches = HotelSearch.objects.filter(user=request.user).order_by('-created_at')
        serializer = HotelSearchSerializer(searches, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = HotelSearchSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_bookings(request):
    """Get all bookings for the authenticated user."""
    bookings = HotelBooking.objects.filter(user=request.user).order_by('-created_at')
    serializer = HotelBookingSerializer(bookings, many=True)
    return Response(serializer.data)