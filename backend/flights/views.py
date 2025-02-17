from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import FlightSearch
from .serializers import FlightSearchSerializer
from .services import search_flights

class FlightSearchView(APIView):
    def post(self, request):
        serializer = FlightSearchSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            flights = search_flights(
                origin=data['origin'],
                destination=data['destination'],
                departure_date=data['departure_date'],
                return_date=data.get('return_date'),
                passengers=data['passengers']
            )
            serializer.save()
            return Response({'flights': flights}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
