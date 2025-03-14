"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import CustomInput from '@/components/CustomInput';

// Define interfaces for our data structures
interface FormData {
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string;
  passengers: number;
  cabin_class: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
}

interface FlightSegment {
  departure: {
    airport: string;
    terminal?: string;
    time: string;
  };
  arrival: {
    airport: string;
    terminal?: string;
    time: string;
  };
  carrierCode: string;
  flightNumber: string;
  aircraft?: string;
  duration: string;
}

interface Itinerary {
  duration: string;
  segments: FlightSegment[];
}

interface Flight {
  price: {
    total: string;
    currency: string;
  };
  outbound: Itinerary;
  return?: Itinerary;
}

// Define props interface for Input component
interface CustomInputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}

const FlightSearch: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    origin: '',
    destination: '',
    departure_date: '',
    return_date: '',
    passengers: 1,
    cabin_class: 'ECONOMY'
  });
  
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDuration = (duration: string): string => {
    if (!duration) return '';
    const hours = duration.match(/(\d+)H/)?.[1] || '0';
    const minutes = duration.match(/(\d+)M/)?.[1] || '0';
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateTimeString: string): string => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return format(date, 'MMM d, h:mm a');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:8000/flights/search/', formData);
      setFlights(response.data.flights);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || 'Failed to fetch flights');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFlightSegments = (segments: FlightSegment[]) => (
    <div className="space-y-2">
      {segments.map((segment, idx) => (
        <div key={idx} className="flex items-center space-x-4 text-sm">
          <div className="w-20">
            {segment.carrierCode} {segment.flightNumber}
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <span>
                {segment.departure.airport} 
                {segment.departure.terminal ? `(T${segment.departure.terminal})` : ''}
              </span>
              <span className="text-gray-500">→</span>
              <span>
                {segment.arrival.airport} 
                {segment.arrival.terminal ? `(T${segment.arrival.terminal})` : ''}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{formatDateTime(segment.departure.time)}</span>
              <span className="text-xs">{formatDuration(segment.duration)}</span>
              <span>{formatDateTime(segment.arrival.time)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen pt-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Find Your Perfect Flight</CardTitle>
            <CardDescription>Search for the best flight deals</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput
                  label="From"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="Airport code (e.g., NYC)"
                  required
                />
                <CustomInput
                  label="To"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Airport code (e.g., LON)"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput
                  label="Departure Date"
                  name="departure_date"
                  type="date"
                  value={formData.departure_date}
                  onChange={handleChange}
                  required
                />
                <CustomInput
                  label="Return Date"
                  name="return_date"
                  type="date"
                  value={formData.return_date}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passengers
                  </label>
                  <select
                    name="passengers"
                    value={formData.passengers}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cabin Class
                  </label>
                  <select
                    name="cabin_class"
                    value={formData.cabin_class}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2"
                    required
                  >
                    <option value="ECONOMY">Economy</option>
                    <option value="PREMIUM_ECONOMY">Premium Economy</option>
                    <option value="BUSINESS">Business</option>
                    <option value="FIRST">First Class</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 flex items-center justify-center disabled:bg-blue-400"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search Flights'
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                {error}
              </div>
            )}

            {flights.length > 0 && (
              <div className="mt-8 space-y-4">
                {flights.map((flight, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium">
                          {formData.origin} → {formData.destination}
                        </h3>
                        <div className="text-xl font-bold">
                          {flight.price.currency} {flight.price.total}
                        </div>
                      </div>

                      {flight.outbound && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Outbound Flight</h4>
                          {renderFlightSegments(flight.outbound.segments)}
                        </div>
                      )}

                      {flight.return && (
                        <div>
                          <h4 className="font-medium mb-2">Return Flight</h4>
                          {renderFlightSegments(flight.return.segments)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlightSearch;
