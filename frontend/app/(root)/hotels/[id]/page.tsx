"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import { Loader2, Star, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

// Define interfaces for hotel details
interface HotelOffer {
  id: string;
  check_in: string;
  check_out: string;
  room_type: string;
  description: string;
  beds: number;
  bed_type: string;
  price: {
    total: string;
    base: string;
    taxes: any[];
    currency: string;
  };
  guests: {
    adults: number;
  };
  policies: any;
  self_rate: boolean;
}

interface HotelDetails {
  hotel_id: string;
  name: string;
  rating: string;
  location: {
    address: any;
    coordinates: any;
  };
  contact: any;
  description: string;
  amenities: string[];
  media: any[];
  available_offers: HotelOffer[];
}

const HotelDetailsPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelId = params.id as string;
  
  const [hotelDetails, setHotelDetails] = useState<HotelDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const check_in_date = searchParams.get('check_in');
        const check_out_date = searchParams.get('check_out');
        const adults = searchParams.get('adults') || '1';
        const rooms = searchParams.get('rooms') || '1';
        
        const response = await axios.get(
          `http://localhost:8000/hotels/details/${hotelId}/`,
          {
            params: {
              check_in_date,
              check_out_date,
              adults,
              rooms
            }
          }
        );
        
        setHotelDetails(response.data.hotel);
        if (response.data.hotel.available_offers.length > 0) {
          setSelectedOffer(response.data.hotel.available_offers[0].id);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.error || 'Failed to fetch hotel details');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [hotelId, searchParams]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const handleBookNow = async () => {
    if (!selectedOffer) return;
    
    // For demonstration purposes, let's just log the booking info
    console.log('Booking hotel with offer ID:', selectedOffer);
    
    // In a real app, you would proceed to a booking form/page
    // window.location.href = `/hotels/booking?offer_id=${selectedOffer}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !hotelDetails) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto mt-10 p-4 bg-red-50 text-red-600 rounded-md">
          {error || 'Failed to load hotel details'}
        </div>
      </div>
    );
  }

  const getSelectedOffer = () => {
    return hotelDetails.available_offers.find(offer => offer.id === selectedOffer);
  };

  return (
    <div className="min-h-screen pt-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{hotelDetails.name}</CardTitle>
                <div className="flex items-center mt-1">
                  {Array.from({ length: parseInt(hotelDetails.rating) || 0 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <CardDescription>
                  {hotelDetails.location.address.lines?.join(', ')}, {hotelDetails.location.address.cityName}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {hotelDetails.media && hotelDetails.media.length > 0 ? (
                  <img 
                    src="/api/placeholder/400/300" 
                    alt={hotelDetails.name} 
                    className="w-full h-64 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-md flex items-center justify-center">
                    <Map className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">Description</h3>
                  <p className="text-sm mt-1">{hotelDetails.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg">Amenities</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {hotelDetails.amenities.map((amenity, index) => (
                      <span key={index} className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">Available Offers</h3>
              <div className="space-y-4">
                {hotelDetails.available_offers.map((offer) => (
                  <Card key={offer.id} className={`cursor-pointer ${selectedOffer === offer.id ? 'border-blue-500 border-2' : ''}`} onClick={() => setSelectedOffer(offer.id)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{offer.room_type}</h4>
                          <p className="text-sm text-gray-500">{offer.bed_type}, {offer.beds} bed(s)</p>
                          <p className="text-sm mt-1">{offer.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            {offer.price.currency} {offer.price.total}
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatDate(offer.check_in)} - {formatDate(offer.check_out)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between items-center">
            <div>
              {getSelectedOffer() && (
                <p className="text-sm text-gray-600">
                  Selected: {getSelectedOffer()?.room_type}, {getSelectedOffer()?.price.currency} {getSelectedOffer()?.price.total}
                </p>
              )}
            </div>
            <button
              onClick={handleBookNow}
              disabled={!selectedOffer}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-gray-300"
            >
              Book Now
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default HotelDetailsPage;