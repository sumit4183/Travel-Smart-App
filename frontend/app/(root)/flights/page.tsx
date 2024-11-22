"use client";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import List from "@/components/ui/List";
import ListItem from "@/components/ui/ListItem";
import Spinner from "@/components/ui/Spinner";
import React, { useState } from "react";

import axios from "axios";

interface Flight {
  departure: string;
  arrival: string;
  departureDate: string;
  arrivalDate: string;
  price: number;
}

export default function FlightSearch() {
  const [formData, setFormData] = useState({
    departure: "",
    arrival: "",
    departureDate: "",
    arrivalDate: "",
  });
  const [results, setResults] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [airports, setAirports] = useState([]);
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "http://localhost:8000/flights/search/",
        {
          params: {
            origin: formData.departure,
            destination: formData.arrival,
            departure_date: formData.departureDate,
            return_date: formData.arrivalDate,
            adults: adults,
          },
        }
      );
      setLoading(false);
      setResults(response.data); // Update the state with the response data
    } catch (error) {
      console.error("Error fetching flight data:", error);
    }
  };

  const fetchAirports = async (keyword: string) => {
    try {
      if (keyword.length < 2) {
        console.log("Keyword must be at least 2 characters long");
        return;
      }

      const response = await axios.get(`/flights/airports/`, {
        params: { keyword }, // Pass query parameters
      });

      setAirports(response.data); // Update the state with the response data
    } catch (error) {
      console.error("Error fetching airports:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Flight Search</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="departure">Departure</Label>
            <Input
              id="departure"
              name="departure"
              type="text"
              value={formData.departure}
              onChange={handleChange}
              placeholder="Enter departure location"
              required
            />
          </div>
          <div>
            <Label htmlFor="arrival">Arrival</Label>
            <Input
              id="arrival"
              name="arrival"
              type="text"
              value={formData.arrival}
              onChange={handleChange}
              placeholder="Enter arrival location"
              required
            />
          </div>
          <div>
            <Label htmlFor="departureDate">Departure Date</Label>
            <Input
              id="departureDate"
              name="departureDate"
              type="date"
              value={formData.departureDate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="arrivalDate">Arrival Date</Label>
            <Input
              id="arrivalDate"
              name="arrivalDate"
              type="date"
              value={formData.arrivalDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Adults:</label>
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Kids:</label>
            <select
              value={kids}
              onChange={(e) => setKids(Number(e.target.value))}
            >
              {[...Array(6)].map((_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full">
            Search Flights
          </Button>
        </form>
      </Card>

      <div className="mt-6">
        {loading && <Spinner className="mx-auto text-center" />}
        {error && (
          <Alert type="error" className="mt-4">
            {error}
          </Alert>
        )}

        <h2 className="text-xl font-bold mt-6">Results</h2>
        {results.length > 0 && (
          <div>
            <h2>Flight Results:</h2>
            <ul>
              {results.map((flight: any, index) => (
                <li key={index}>
                  {flight.itineraries.map((itinerary: any) => (
                    <div key={itinerary.id}>
                      {itinerary.segments.map((segment: any) => (
                        <p key={segment.id}>
                          {segment.departure.iataCode} to{" "}
                          {segment.arrival.iataCode} on {segment.departure.at}
                        </p>
                      ))}
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
