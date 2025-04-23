from datetime import datetime
import requests
from django.conf import settings

class AmadeusHotelService:
    def __init__(self):
        self.api_key = settings.AMADEUS_API_KEY
        self.api_secret = settings.AMADEUS_API_SECRET
        self.token = None
        
    def get_access_token(self):
        """Get OAuth2 token from Amadeus API."""
        url = 'https://test.api.amadeus.com/v1/security/oauth2/token'
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        data = {
            'grant_type': 'client_credentials',
            'client_id': self.api_key,
            'client_secret': self.api_secret
        }
        
        response = requests.post(url, headers=headers, data=data)
        if response.status_code == 200:
            self.token = response.json()['access_token']
            return self.token
        raise Exception(f'Failed to get access token: {response.text}')

    def get_auth_headers(self):
        """Get authorization headers with token."""
        if not self.token:
            self.get_access_token()
            
        return {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }

    def handle_response(self, response, retry_func=None):
        """Handle API response with token refresh if needed."""
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 401 and retry_func:
            # Token expired, get new token and retry
            self.get_access_token()
            return retry_func()
        else:
            raise Exception(f'API request failed: {response.status_code} - {response.text}')

    # Step 1: Hotel List API
    def get_hotels_by_city(self, city_code, radius=None, chain_codes=None, amenities=None, ratings=None):
        """Get list of hotels in a city using the Hotel List API."""
        def make_request():
            headers = self.get_auth_headers()
            url = 'https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city'
            
            params = {'cityCode': city_code}
            
            if radius:
                params['radius'] = radius
                params['radiusUnit'] = 'KM'
                
            if chain_codes:
                params['chainCodes'] = chain_codes
                
            if amenities:
                params['amenities'] = amenities
                
            if ratings:
                params['ratings'] = ratings
            
            return requests.get(url, headers=headers, params=params)
        
        response = make_request()
        return self.handle_response(response, make_request)
    
    def get_hotels_by_geocode(self, latitude, longitude, radius=None, chain_codes=None, amenities=None, ratings=None):
        """Get list of hotels by geographic coordinates using the Hotel List API."""
        def make_request():
            headers = self.get_auth_headers()
            url = 'https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode'
            
            params = {
                'latitude': latitude,
                'longitude': longitude
            }
            
            if radius:
                params['radius'] = radius
                params['radiusUnit'] = 'KM'
                
            if chain_codes:
                params['chainCodes'] = chain_codes
                
            if amenities:
                params['amenities'] = amenities
                
            if ratings:
                params['ratings'] = ratings
            
            return requests.get(url, headers=headers, params=params)
        
        response = make_request()
        return self.handle_response(response, make_request)
    
    # Step 2: Hotel Search API
    def search_hotel_offers(self, hotel_ids=None, city_code=None, check_in_date=None, 
                           check_out_date=None, adults=1, rooms=1, price_range=None):
        """Search hotel offers using Amadeus Hotel Search API."""
        def make_request():
            headers = self.get_auth_headers()
            url = 'https://test.api.amadeus.com/v3/shopping/hotel-offers'
            
            params = {}
            
            # Hotel Search API can search by hotelIds OR cityCode
            if hotel_ids:
                if isinstance(hotel_ids, list):
                    params['hotelIds'] = ','.join(hotel_ids)
                else:
                    params['hotelIds'] = hotel_ids
            elif city_code:
                params['cityCode'] = city_code
            
            if check_in_date:
                params['checkInDate'] = check_in_date
                
            if check_out_date:
                params['checkOutDate'] = check_out_date
                
            params['adults'] = adults
            params['roomQuantity'] = rooms
            
            if price_range:
                params['priceRange'] = price_range
            
            return requests.get(url, headers=headers, params=params)
        
        response = make_request()
        return self.handle_response(response, make_request)
    
    def get_hotel_offer_details(self, offer_id):
        """Get detailed information about a specific hotel offer."""
        def make_request():
            headers = self.get_auth_headers()
            url = f'https://test.api.amadeus.com/v3/shopping/hotel-offers/{offer_id}'
            return requests.get(url, headers=headers)
        
        response = make_request()
        return self.handle_response(response, make_request)
    
    # Step 3: Hotel Booking API
    def book_hotel(self, offer_id, guests, payments=None, rooms=None):
        """Book a hotel room using Amadeus Hotel Booking API."""
        def make_request():
            headers = self.get_auth_headers()
            url = 'https://test.api.amadeus.com/v1/booking/hotel-bookings'
            
            # Format the request body according to the API requirements
            payload = {
                "data": {
                    "offerId": offer_id,
                    "guests": guests
                }
            }
            
            if payments:
                payload['data']['payments'] = payments
                
            if rooms:
                payload['data']['rooms'] = rooms
        
            print(f"Booking API Request URL: {url}")
            print(f"Booking API Request Headers: {headers}")
            print(f"Booking API Request Payload: {payload}")
            
            response = requests.post(url, headers=headers, json=payload)
            
            print(f"Booking API Response Status: {response.status_code}")
            print(f"Booking API Response Headers: {response.headers}")
            print(f"Booking API Response Content: {response.content}")
            
            return response
        
        response = make_request()
        return self.handle_response(response, make_request)
    
    # Helper methods for formatting responses
    def format_hotel_list(self, api_response):
        """Format the response from Hotel List API."""
        hotels = []
        for hotel in api_response.get('data', []):
            hotels.append({
                'hotel_id': hotel.get('hotelId'),
                'name': hotel.get('name'),
                'chain_code': hotel.get('chainCode'),
                'iata_code': hotel.get('iataCode'),
                'location': {
                    'latitude': hotel.get('geoCode', {}).get('latitude'),
                    'longitude': hotel.get('geoCode', {}).get('longitude'),
                    'country_code': hotel.get('address', {}).get('countryCode')
                },
                'last_update': hotel.get('lastUpdate')
            })
        return hotels
    
    def format_hotel_offers(self, api_response):
        """Format the response from Hotel Search API."""
        offers = []
        for hotel in api_response.get('data', []):
            hotel_info = hotel.get('hotel', {})
            hotel_offers = hotel.get('offers', [])
            
            formatted_offers = []
            for offer in hotel_offers:
                room_info = offer.get('room', {})
                price_info = offer.get('price', {})
                
                formatted_offers.append({
                    'offer_id': offer.get('id'),
                    'room_type': room_info.get('typeEstimated', {}).get('category'),
                    'description': room_info.get('description', {}).get('text'),
                    'price': {
                        'currency': price_info.get('currency'),
                        'total': price_info.get('total'),
                        'base': price_info.get('base'),
                    },
                    'cancellation_policy': offer.get('policies', {}).get('cancellations', []),
                    'payment_policy': offer.get('policies', {}).get('paymentType')
                })
            
            offers.append({
                'hotel_id': hotel_info.get('hotelId'),
                'name': hotel_info.get('name'),
                'rating': hotel_info.get('rating'),
                'location': hotel_info.get('address', {}),
                'contact': hotel_info.get('contact', {}),
                'offers': formatted_offers
            })
        
        return offers
    
    def format_booking_confirmation(self, api_response):
        """Format the response from Hotel Booking API."""
        # If api_response is a Response object, extract its data first
        if hasattr(api_response, 'data'):
            booking_data = api_response.data
        else:
            # Assume it's already a dictionary
            booking_data = api_response.get('data', {})
        
        return {
            'booking_id': booking_data.get('id'),
            'providerConfirmationId': booking_data.get('providerConfirmationId'),
            'status': booking_data.get('status'),
            'hotel': booking_data.get('hotel', {}).get('name'),
            'check_in': booking_data.get('checkInDate'),
            'check_out': booking_data.get('checkOutDate'),
            'guests': booking_data.get('guests', []),
            'price': booking_data.get('price', {})
        }