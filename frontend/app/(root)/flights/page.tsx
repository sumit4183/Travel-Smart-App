"use client";

import React, { useState } from "react";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Spinner from "@/components/ui/Spinner";
import axios from "axios";

interface Flight {
  departure: string;
  arrival: string;
  departureDate: string;
  arrivalDate: string;
  price: { total: number; currency: string };
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
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean | null>(null);
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [travelers, setTravelers] = useState<
    { firstName: string; lastName: string; dateOfBirth: string }[]
  >([]);
  const [payment, setPayment] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Updates the traveler information based on the number of adults and kids
  React.useEffect(() => {
    const totalTravelers = adults + kids;
    setTravelers(
      Array.from({ length: totalTravelers }, () => ({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
      }))
    );
  }, [adults, kids]);

  // Handles input changes for each traveler
  const handleTravelerChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedTravelers = [...travelers];
    updatedTravelers[index][field as keyof (typeof travelers)[0]] = value;
    setTravelers(updatedTravelers);
  };

  // Handles changes in the payment information fields
  const handlePaymentChange = (field: string, value: string) => {
    setPayment({ ...payment, [field]: value });
  };

  // Opens the booking modal with the selected flight information
  const openBookingModal = (flight: Flight) => {
    setSelectedFlight(flight);
    setBookingSuccess(null); // Reset booking status
  };

  // Closes the booking modal
  const closeBookingModal = () => {
    setSelectedFlight(null);
  };

  // Handles flight search submission
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
            kids: kids,
          },
        }
      );

      setResults(response.data);
    } catch (error) {
      console.error("Error fetching flight data:", error);
      setError("Error fetching flight data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Confirms the booking
  const confirmBooking = async () => {
    if (!selectedFlight) return;

    try {
      // Tokenizing payment details before sending
      const tokenResponse = await axios.post(
        "http://localhost:8000/flights/payments/tokenize/",
        {
          cardNumber: payment.cardNumber,
          expiryDate: payment.expiryDate,
          cvv: payment.cvv,
        }
      );

      const token = tokenResponse.data.token;

      console.log(token);
      const response = await axios.post("http://localhost:8000/flights/book/", {
        departure: formData.departure,
        arrival: formData.arrival,
        departureDate: formData.departureDate,
        arrivalDate: formData.arrivalDate,
        price: selectedFlight.price.total,
        currency: selectedFlight.price.currency,
        adults: adults,
        kids: kids,
        travelers: travelers,
        paymentToken: token, // Send only the token, not raw card data
      });

      if (response.status === 200) {
        setBookingSuccess(true);
        setBookingError(null); // Clear error message if successful
      } else {
        throw new Error("Booking failed. Please try again.");
      }
    } catch (error) {
      setBookingError("Booking failed. Please try again."); // Store error message
    } finally {
      setSelectedFlight(null); // ✅ Always close booking modal
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
              type="text"
              value={formData.departure}
              onChange={(e) =>
                setFormData({ ...formData, departure: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="arrival">Arrival</Label>
            <Input
              id="arrival"
              type="text"
              value={formData.arrival}
              onChange={(e) =>
                setFormData({ ...formData, arrival: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="departureDate">Departure Date</Label>
            <Input
              id="departureDate"
              type="date"
              value={formData.departureDate}
              onChange={(e) =>
                setFormData({ ...formData, departureDate: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="arrivalDate">Arrival Date</Label>
            <Input
              id="arrivalDate"
              type="date"
              value={formData.arrivalDate}
              onChange={(e) =>
                setFormData({ ...formData, arrivalDate: e.target.value })
              }
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
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Departure</th>
              <th className="border p-2">Arrival</th>
              <th className="border p-2">Departure Date</th>
              <th className="border p-2">Arrival Date</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((flight, index) => (
              <tr
                key={index}
                className="cursor-pointer hover:bg-gray-200 transition"
              >
                <td className="border p-2">{formData.departure}</td>
                <td className="border p-2">{formData.arrival}</td>
                <td className="border p-2">{formData.departureDate}</td>
                <td className="border p-2">{formData.arrivalDate}</td>
                <td className="border p-2">
                  {flight.price.total} {flight.price.currency}
                </td>
                <td className="border p-2">
                  <Button onClick={() => openBookingModal(flight)}>Book</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedFlight && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[600px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Confirm Your Booking</h2>

            {/* Flight Details */}
            <div className="mb-4 border-b pb-4">
              <p>
                <strong>Departure:</strong> {formData.departure} (
                {formData.departureDate})
              </p>
              <p>
                <strong>Arrival:</strong> {formData.arrival} (
                {formData.arrivalDate})
              </p>
              <p>
                <strong>Price:</strong> {selectedFlight.price.total}{" "}
                {selectedFlight.price.currency}
              </p>
            </div>

            {/* Traveler Details */}
            <div className="space-y-4 mb-6">
              {travelers.map((traveler, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">
                    Traveler {index + 1}
                  </h3>
                  <Input
                    className="w-full mt-2"
                    type="text"
                    placeholder="First Name"
                    value={traveler.firstName}
                    onChange={(e) =>
                      handleTravelerChange(index, "firstName", e.target.value)
                    }
                    required
                  />
                  <Input
                    className="w-full mt-2"
                    type="text"
                    placeholder="Last Name"
                    value={traveler.lastName}
                    onChange={(e) =>
                      handleTravelerChange(index, "lastName", e.target.value)
                    }
                    required
                  />
                  <Input
                    className="w-full mt-2"
                    type="date"
                    placeholder="Date of Birth"
                    value={traveler.dateOfBirth}
                    onChange={(e) =>
                      handleTravelerChange(index, "dateOfBirth", e.target.value)
                    }
                    required
                  />
                </div>
              ))}
            </div>

            {/* Payment Information */}
            <div className="space-y-4 mb-6 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">Payment Details</h3>
              <Input
                className="w-full"
                type="text"
                placeholder="Card Number"
                value={payment.cardNumber}
                onChange={(e) =>
                  handlePaymentChange("cardNumber", e.target.value)
                }
                required
              />
              <Input
                className="w-full"
                type="text"
                placeholder="Expiry Date (MM/YY)"
                value={payment.expiryDate}
                onChange={(e) =>
                  handlePaymentChange("expiryDate", e.target.value)
                }
                required
              />
              <Input
                className="w-full"
                type="password"
                placeholder="CVV"
                value={payment.cvv}
                onChange={(e) => handlePaymentChange("cvv", e.target.value)}
                required
              />
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <Button
                onClick={closeBookingModal}
                className="bg-gray-500 px-5 py-3 text-lg"
              >
                Close
              </Button>
              <Button
                onClick={confirmBooking}
                className="bg-blue-600 px-5 py-3 text-lg"
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        </div>
      )}

      {bookingError && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] text-center">
            <h2 className="text-xl font-bold text-red-600">Booking Failed</h2>
            <p className="mt-2">{bookingError}</p>
            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg"
              onClick={() => setBookingError(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
