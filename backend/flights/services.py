from datetime import datetime
import requests
from django.conf import settings

class AmadeusService:
    def __init__(self):
        self.api_key = settings.AMADEUS_API_KEY
        self.api_secret = settings.AMADEUS_API_SECRET
        self.base_url = 'https://test.api.amadeus.com/v2'
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
        raise Exception('Failed to get access token')

    def search_flights(self, origin, destination, departure_date, return_date=None, 
                      passengers=1, cabin_class='ECONOMY'):
        """Search flights using Amadeus Flight Offers Search API."""
        if not self.token:
            self.get_access_token()
            
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }

        # Construct travelers list based on number of passengers
        travelers = [
            {
                "id": str(i + 1),
                "travelerType": "ADULT"
            } for i in range(passengers)
        ]

        # Build origin destinations
        origin_destinations = [
            {
                "id": "1",
                "originLocationCode": origin,
                "destinationLocationCode": destination,
                "departureDateTimeRange": {
                    "date": departure_date,
                    "time": "00:00:00"
                }
            }
        ]

        # Add return flight if return_date is provided
        if return_date:
            origin_destinations.append({
                "id": "2",
                "originLocationCode": destination,
                "destinationLocationCode": origin,
                "departureDateTimeRange": {
                    "date": return_date,
                    "time": "00:00:00"
                }
            })

        payload = {
            "currencyCode": "USD",
            "originDestinations": origin_destinations,
            "travelers": travelers,
            "sources": ["GDS"],
            "searchCriteria": {
                "maxFlightOffers": 50,
                "flightFilters": {
                    "cabinRestrictions": [
                        {
                            "cabin": cabin_class.upper(),
                            "coverage": "MOST_SEGMENTS",
                            "originDestinationIds": ["1"] + (["2"] if return_date else [])
                        }
                    ]
                }
            }
        }

        url = f'{self.base_url}/shopping/flight-offers'
        response = requests.post(url, headers=headers, json=payload)

        if response.status_code == 200:
            return self.format_flight_results(response.json())
        elif response.status_code == 401:
            # Token expired, get new token and retry
            self.get_access_token()
            headers['Authorization'] = f'Bearer {self.token}'
            response = requests.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                return self.format_flight_results(response.json())
        
        raise Exception(f'Failed to fetch flights: {response.text}')

    def format_flight_results(self, data):
        """Format the Amadeus API response into a more user-friendly structure."""
        formatted_flights = []
        
        for offer in data.get('data', []):
            price = offer.get('price', {})
            itineraries = offer.get('itineraries', [])
            
            flight_offer = {
                'price': {
                    'total': price.get('total'),
                    'currency': price.get('currency', 'USD')
                },
                'outbound': self.format_itinerary(itineraries[0]) if itineraries else None,
                'return': self.format_itinerary(itineraries[1]) if len(itineraries) > 1 else None,
                'offer': offer
            }
            formatted_flights.append(flight_offer)
            
        return formatted_flights
    
    def format_itinerary(self, itinerary):
        """Format a single itinerary from the flight offer."""
        segments = itinerary.get('segments', [])
        if not segments:
            return None
            
        return {
            'duration': itinerary.get('duration'),
            'segments': [{
                'departure': {
                    'airport': segment.get('departure', {}).get('iataCode'),
                    'terminal': segment.get('departure', {}).get('terminal'),
                    'time': segment.get('departure', {}).get('at')
                },
                'arrival': {
                    'airport': segment.get('arrival', {}).get('iataCode'),
                    'terminal': segment.get('arrival', {}).get('terminal'),
                    'time': segment.get('arrival', {}).get('at')
                },
                'carrierCode': segment.get('carrierCode'),
                'flightNumber': segment.get('number'),
                'aircraft': segment.get('aircraft', {}).get('code'),
                'duration': segment.get('duration')
            } for segment in segments]
        }