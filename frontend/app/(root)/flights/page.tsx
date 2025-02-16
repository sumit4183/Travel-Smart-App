"use client";

import React, { useState } from 'react';
import { label } from 'react';
import axios from 'axios';
import Input from '@/components/ui/Input';

const FlightSearch = () => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departure_date: '',
    return_date: '',
    passengers: 1,
    cabin_class: '',
  });
  const [flights, setFlights] = useState([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/flights/search/', formData);
      setFlights(response.data.flights);
    } catch (error) {
      console.error('Failed to fetch flights:', error);
    }
  };

  return (
    <div className='min-h-screen pt-10'>
      <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md">
        <h1 className="text-3xl font-bold mb-6">Find Your Perfect Flight</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* From and To */}
          <div className="flex space-x-4 w-full">
            <div className="w-1/2">
              <Input
                label="From"
                type="text"
                id="origin"
                placeholder="Origin city or airport"
                value={formData.origin}
                onChange={handleChange}
                required
              />
            </div>
            <div className="w-1/2">
              <Input
                label="To"
                type="text"
                id="destination"
                placeholder="Destination city or airport"
                value={formData.destination}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Departure and Return */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <Input
                label="Departure Date"
                type="date"
                id="departure_date"
                placeholder="Select departure date"
                value={formData.departure_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="w-1/2">
              <Input
                label="Return Date"
                type="date"
                id="return_date"
                placeholder="Select return date"
                value={formData.return_date}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Passengers and Cabin Class */}
          <div className="flex space-x-4">
            <div className="flex flex-col w-1/2">
              <label htmlFor="passengers" className="text-sm font-medium text-gray-700 mb-1">Passengers</label>
              <select
                id="passengers"
                name="passengers"
                value={formData.passengers}
                onChange={handleChange}
                className="border p-3 rounded"
                required
              >
                <option value="">Select passengers</option>
                {[...Array(10).keys()].map((n) => (
                  <option key={n + 1} value={n + 1}>
                    {n + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col w-1/2">
            <label htmlFor="cabin_class" className="text-sm font-medium text-gray-700 mb-1">Cabin Class</label>
              <select
                id="cabin_class"
                name="cabin_class"
                value={formData.cabin_class}
                onChange={handleChange}
                className="border p-3 rounded"
                required
              >
                <option value="">Select class</option>
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded flex items-center justify-center hover:bg-gray-800"
          >
            ✈️ Search Flights
          </button>
        </form>

        {/* Filters */}
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Filters</h2>
          <div className="flex space-x-4">
            <div className="flex flex-col w-1/2">
              <label htmlFor="airlines" className="text-sm font-medium text-gray-700 mb-1">Airlines</label>
              <select
                id="airlines"
                name="airlines"
                // value={formData.cabin_class}
                // onChange={handleChange}
                className="border p-3 rounded"
                required
              >
                <option value="">All Airlines</option>
                <option value="airline1">Airline 1</option>
                <option value="airline2">Airline 2</option>
              </select>
            </div>
            <div className="flex flex-col w-1/2">
              <label htmlFor="stops" className="text-sm font-medium text-gray-700 mb-1">Stops</label>
              <select
                id="stops"
                name="stops"
                // value={formData.cabin_class}
                // onChange={handleChange}
                className="border p-3 rounded"
                required
              >
                <option value="">Any</option>
                <option value="nonstop">Non-stop</option>
                <option value="one_stop">1 Stop</option>
                <option value="two_plus_stops">2+ Stops</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search results */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Search Results</h2>
          <ul className="list-disc pl-6">
            {flights.map((flight, index) => (
              <li key={index} className="mb-2">
                {flight.airline} - {flight.flight_number} - {flight.departure} → {flight.arrival}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FlightSearch;
