"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Loader2, Map, Star, Wifi, Coffee, Utensils, Car, Tv, AlertCircle } from 'lucide-react';

// Define interfaces for our data structures
interface FormData {
  city_code: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  rooms: number;
  rating?: string;
  amenities?: string;
}

interface HotelLocation {
  latitude: number;
  longitude: number;
  country_code: string;
}

interface HotelOffer {
  offer_id: string;
  room_type: string;
  description: string;
  price: {
    currency: string;
    total: string;
    base: string;
  };
  cancellation_policy: any[];
  payment_policy: string;
}

interface Hotel {
  hotel_id: string;
  name: string;
  chain_code: string;
  iata_code: string;
  rating?: string;
  location: HotelLocation;
  last_update: string;
  offers?: HotelOffer[];
}

const HotelSearch: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    city_code: '',
    check_in_date: '',
    check_out_date: '',
    adults: 1,
    rooms: 1
  });
  
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [step, setStep] = useState<'search' | 'results' | 'booking'>('search');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return <Wifi className="w-4 h-4" />;
    if (lowerAmenity.includes('breakfast') || lowerAmenity.includes('coffee')) return <Coffee className="w-4 h-4" />;
    if (lowerAmenity.includes('restaurant') || lowerAmenity.includes('dining')) return <Utensils className="w-4 h-4" />;
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('garage')) return <Car className="w-4 h-4" />;
    if (lowerAmenity.includes('tv') || lowerAmenity.includes('television')) return <Tv className="w-4 h-4" />;
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Step 1: Get hotel list
      const hotelsResponse = await axios.get('http://localhost:8000/hotels/list/', {
        params: {
          city_code: formData.city_code,
          amenities: formData.amenities,
          ratings: formData.rating
        }
      });
      
      const hotelList = hotelsResponse.data.hotels;
      
      if (hotelList.length === 0) {
        setError('No hotels found for the given criteria');
        setLoading(false);
        return;
      }
      
      // Step 2: Get hotel offers if check-in and check-out dates are provided
      if (formData.check_in_date && formData.check_out_date) {
        const hotelIds = hotelList.map((hotel: Hotel) => hotel.hotel_id).join(',');
        
        const offersResponse = await axios.get('http://localhost:8000/hotels/offers/', {
          params: {
            hotel_ids: hotelIds,
            check_in_date: formData.check_in_date,
            check_out_date: formData.check_out_date,
            adults: formData.adults,
            rooms: formData.rooms
          }
        });
        
        // Combine hotel information with offers
        const hotelsWithOffers = offersResponse.data.offers.map((hotelOffer: any) => {
          const hotelInfo = hotelList.find((h: Hotel) => h.hotel_id === hotelOffer.hotel_id);
          return {
            ...hotelInfo,
            offers: hotelOffer.offers,
          };
        });
        
        setHotels(hotelsWithOffers);
      } else {
        // Just use the hotel list if no dates are provided
        setHotels(hotelList);
      }
      
      setStep('results');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || 'Failed to fetch hotels');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHotelSelect = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setStep('booking');
  };

  const handleBookNow = async (hotel: Hotel, offerId: string) => {
    try {
      setLoading(true);
      
      // In a real application, you would collect guest information and payment details here
      const bookingData = {
        offer_id: offerId,
        guests: [
          {
            name: {
              title: "MR",
              firstName: "John",
              lastName: "Doe"
            },
            contact: {
              phone: "+1-123-456-7890",
              email: "john.doe@example.com"
            }
          }
        ],
        payments: [
          {
            method: "creditCard",
            card: {
              vendorCode: "VI",
              cardNumber: "4111111111111111",
              expiryDate: "2025-12"
            }
          }
        ]
      };
      
      const response = await axios.post('http://localhost:8000/hotels/book/', bookingData);
      
      // Handle successful booking
      alert(`Booking successful! Confirmation number: ${response.data.booking.booking_id}`);
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || 'Failed to book hotel');
      } else {
        setError('An unexpected error occurred during booking');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderSearchForm = () => (
    <div className="w-full max-w-lg mx-auto bg-white rounded-lg border p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Find Your Perfect Hotel</h2>
        <p className="text-gray-600">Search for hotels by city and dates</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="city_code" className="block text-sm font-medium mb-1">
              City Code (e.g., NYC, LON, PAR)
            </label>
            <input 
              id="city_code" 
              name="city_code" 
              value={formData.city_code} 
              onChange={handleChange} 
              placeholder="Enter city code"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="check_in_date" className="block text-sm font-medium mb-1">
              Check-in Date
            </label>
            <input 
              id="check_in_date" 
              name="check_in_date" 
              type="date" 
              value={formData.check_in_date} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="check_out_date" className="block text-sm font-medium mb-1">
              Check-out Date
            </label>
            <input 
              id="check_out_date" 
              name="check_out_date" 
              type="date" 
              value={formData.check_out_date} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="adults" className="block text-sm font-medium mb-1">
                Adults
              </label>
              <select 
                id="adults"
                name="adults"
                value={formData.adults}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                {[1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="rooms" className="block text-sm font-medium mb-1">
                Rooms
              </label>
              <select 
                id="rooms"
                name="rooms"
                value={formData.rooms}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                {[1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="rating" className="block text-sm font-medium mb-1">
              Star Rating
            </label>
            <select 
              id="rating"
              name="rating"
              value={formData.rating || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Any rating</option>
              <option value="3">3 stars and above</option>
              <option value="4">4 stars and above</option>
              <option value="5">5 stars</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="amenities" className="block text-sm font-medium mb-1">
              Amenities
            </label>
            <select 
              id="amenities"
              name="amenities"
              value={formData.amenities || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Any amenities</option>
              <option value="SWIMMING_POOL">Swimming Pool</option>
              <option value="WIFI">WiFi</option>
              <option value="RESTAURANT">Restaurant</option>
              <option value="PARKING">Parking</option>
              <option value="FITNESS_CENTER">Fitness Center</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-blue-300 transition"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </span>
            ) : (
              'Search Hotels'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderHotelResults = () => (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {hotels.length} Hotels Found
        </h2>
        <button 
          onClick={() => setStep('search')} 
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Modify Search
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
          <span className="text-red-800">{error}</span>
        </div>
      )}
      
      <div className="space-y-6">
        {hotels.map((hotel) => (
          <div 
            key={hotel.hotel_id} 
            className="bg-white rounded-lg border overflow-hidden shadow-md"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-1">{hotel.name}</h3>
                  <div className="text-sm text-gray-500 mb-2">
                    {hotel.location?.country_code} • {hotel.chain_code} Chain 
                  </div>
                </div>
                <div className="flex items-center bg-blue-100 px-2 py-1 rounded">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="font-medium">{hotel.rating || 'N/A'}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Location</h4>
                <div className="bg-gray-100 p-3 rounded-md text-sm flex items-center">
                  <Map className="h-4 w-4 mr-2" />
                  <span>
                    Latitude: {hotel.location?.latitude}, Longitude: {hotel.location?.longitude}
                  </span>
                </div>
              </div>
              
              {hotel.offers && hotel.offers.length > 0 ? (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Available Offers</h4>
                  <div className="space-y-3">
                    {hotel.offers.slice(0, 2).map((offer) => (
                      <div key={offer.offer_id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{offer.room_type || 'Standard Room'}</div>
                            <div className="text-sm text-gray-600 mt-1">{offer.description || 'Room details not available'}</div>
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Payment:</span> {offer.payment_policy || 'Standard policy'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {offer.price.currency} {offer.price.total}
                            </div>
                            <div className="text-sm text-gray-500">taxes included</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleBookNow(hotel, offer.offer_id)}
                          className="mt-3 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md w-full transition"
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                    
                    {hotel.offers.length > 2 && (
                      <button
                        onClick={() => handleHotelSelect(hotel)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                      >
                        View {hotel.offers.length - 2} more offers
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <button
                    onClick={() => handleHotelSelect(hotel)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md w-full transition"
                  >
                    Check Availability
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderBookingView = () => {
    if (!selectedHotel) return null;
    
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setStep('results')}
            className="mr-3 text-blue-600 hover:text-blue-800"
          >
            ← Back to Results
          </button>
          <h2 className="text-2xl font-bold">{selectedHotel.name}</h2>
        </div>
        
        <div className="bg-white rounded-lg border overflow-hidden shadow-md p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Hotel Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Chain:</span> {selectedHotel.chain_code}
                </div>
                <div>
                  <span className="font-medium">Rating:</span> {selectedHotel.rating || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {selectedHotel.location?.country_code}
                </div>
                <div>
                  <span className="font-medium">Coordinates:</span> {selectedHotel.location?.latitude}, {selectedHotel.location?.longitude}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {formatDate(selectedHotel.last_update)}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Guest Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="John"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="Doe"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input 
                    type="email" 
                    placeholder="john.doe@example.com"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input 
                    type="tel" 
                    placeholder="+1-123-456-7890"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Available Offers</h3>
            {selectedHotel.offers && selectedHotel.offers.length > 0 ? (
              <div className="space-y-4">
                {selectedHotel.offers.map((offer) => (
                  <div key={offer.offer_id} className="border rounded-md p-4">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="mb-4 md:mb-0">
                        <div className="font-medium text-lg">{offer.room_type || 'Standard Room'}</div>
                        <div className="text-gray-600 mt-1">{offer.description || 'Room details not available'}</div>
                        <div className="mt-3">
                          <div><span className="font-medium">Payment:</span> {offer.payment_policy || 'Standard policy'}</div>
                          {offer.cancellation_policy && offer.cancellation_policy.length > 0 && (
                            <div className="mt-1"><span className="font-medium">Cancellation:</span> Available</div>
                          )}
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {offer.price.currency} {offer.price.total}
                        </div>
                        <div className="text-sm text-gray-500">taxes included</div>
                        <button
                          onClick={() => handleBookNow(selectedHotel, offer.offer_id)}
                          className="mt-3 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-md">
                <p>No offers available for the selected dates.</p>
                <button
                  onClick={() => setStep('search')}
                  className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Modify Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {error && step === 'search' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md max-w-lg mx-auto flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
          <span className="text-red-800">{error}</span>
        </div>
      )}
      
      {step === 'search' && renderSearchForm()}
      {step === 'results' && renderHotelResults()}
      {step === 'booking' && renderBookingView()}
    </div>
  );
      }
      export default HotelSearch;