from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny  # Add this
from .models import FlightSearch
from .serializers import FlightSearchSerializer
from .services import AmadeusService

class FlightSearchView(APIView):
    ermission_classes = [AllowAny]  # Add this line


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