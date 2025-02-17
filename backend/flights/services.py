import requests

def search_flights(origin, destination, departure_date, return_date=None, passengers=1):
    api_key = 'api_key_here'
    url = f'http://api.aviationstack.com/v1/flights?access_key={api_key}'
    params = {
        'origin': origin,
        'destination': destination,
        'departure_date': departure_date,
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return {'error': 'Failed to fetch flight data'}
