"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomInput from "@/components/CustomInput";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const COUNTRY_LIST = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "AU", name: "Australia" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "ZA", name: "South Africa" },
  { code: "RU", name: "Russia" },
  { code: "KR", name: "South Korea" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SG", name: "Singapore" },
  { code: "NZ", name: "New Zealand" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "TH", name: "Thailand" },
  { code: "MY", name: "Malaysia" },
  { code: "PH", name: "Philippines" },
  { code: "ID", name: "Indonesia" },
  { code: "EG", name: "Egypt" },
  { code: "AR", name: "Argentina" },
  { code: "NG", name: "Nigeria" },
];

// Define interfaces for our data structures
interface FormData {
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string;
  passengers: number;
  cabin_class: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
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

interface Price {
  currency: string;
  total: string;
  base: string;
  fees: { amount: string; type: string }[];
  grandTotal: string;
}

interface Amenity {
  description: string;
  isChargeable: boolean;
  amenityType: string;
  amenityProvider: { name: string };
}

interface FareDetails {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  brandedFare: string;
  brandedFareLabel: string;
  class: string;
  amenities: Amenity[];
}

interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: Price;
  fareDetailsBySegment: FareDetails[];
}

interface FlightOffer {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  isUpsellOffer: boolean;
  lastTicketingDate: string;
  lastTicketingDateTime: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

interface Flight {
  price: {
    total: string;
    currency: string;
  };
  outbound: Itinerary;
  return?: Itinerary;
  offer: FlightOffer;
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

interface Traveler {
  id: string;
  dateOfBirth: string;
  name: { firstName: string; lastName: string };
  gender: string;
  contact: {
    emailAddress: string;
    phones: [
      { deviceType: string; countryCallingCode: string; number: string }
    ];
  };
  documents: [
    {
      documentType: string;
      birthPlace: string;
      issuanceLocation: string;
      issuanceDate: string;
      number: string;
      expiryDate: string;
      issuanceCountry: string;
      validityCountry: string;
      nationality: string;
      holder: boolean;
    }
  ];
}

const FlightSearch: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    origin: "",
    destination: "",
    departure_date: "",
    return_date: "",
    passengers: 1,
    cabin_class: "ECONOMY",
  });

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [travelersV2, setTravelersV2] = useState<Traveler[]>([
    {
      id: "1",
      dateOfBirth: "",
      name: { firstName: "", lastName: "" },
      gender: "",
      contact: {
        emailAddress: "",
        phones: [{ deviceType: "MOBILE", countryCallingCode: "", number: "" }],
      },
      documents: [
        {
          documentType: "PASSPORT",
          birthPlace: "",
          issuanceLocation: "",
          issuanceDate: "",
          number: "",
          expiryDate: "",
          issuanceCountry: "",
          validityCountry: "",
          nationality: "",
          holder: true,
        },
      ],
    },
  ]);
  const [payment, setPayment] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  React.useEffect(() => {
    const totalTravelers = formData.passengers;
    setTravelersV2(
      Array.from(
        { length: totalTravelers },
        (_, i) =>
          travelersV2[i] || {
            id: String(i + 1),
            dateOfBirth: "",
            name: { firstName: "", lastName: "" },
            gender: "",
            contact: {
              emailAddress: "",
              phones: [
                { deviceType: "MOBILE", countryCallingCode: "", number: "" },
              ],
            },
            documents: [
              {
                documentType: "PASSPORT",
                birthPlace: "",
                issuanceLocation: "",
                issuanceDate: "",
                number: "",
                expiryDate: "",
                issuanceCountry: "",
                validityCountry: "",
                nationality: "",
                holder: true,
              },
            ],
          }
      )
    );
  }, [formData.passengers]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatDuration = (duration: string): string => {
    if (!duration) return "";
    const hours = duration.match(/(\d+)H/)?.[1] || "0";
    const minutes = duration.match(/(\d+)M/)?.[1] || "0";
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateTimeString: string): string => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    return format(date, "MMM d, h:mm a");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/flights/search/",
        formData
      );
      setFlights(response.data.flights);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || "Failed to fetch flights");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTravelerChangeV2 = (
    index: number,
    fieldPath: string,
    value: string | boolean
  ) => {
    const updatedTravelers = [...travelersV2];
    const fields = fieldPath.split(".");
    let obj: any = updatedTravelers[index];
    for (let i = 0; i < fields.length - 1; i++) {
      obj = obj[fields[i]];
    }
    obj[fields[fields.length - 1]] = value;
    setTravelersV2(updatedTravelers);
  };

  const handlePaymentChange = (field: string, value: string) => {
    setPayment({ ...payment, [field]: value });
  };

  const openBookingModal = (flight: Flight) => {
    setSelectedFlight(flight);
    setBookingSuccess(null); // Reset booking status
  };

  const closeBookingModal = () => {
    setSelectedFlight(null);
  };

  const confirmBooking = async () => {
    // if (!selectedFlight || !user) {
    //   setBookingError("You must be logged in to book a flight.");
    //   return;
    // }

    try {
      setBooking(true);
      closeBookingModal();

      const data = {
        flight: selectedFlight?.offer,
        traveler: travelersV2,
      };
      const response = await axios.post(
        "http://localhost:8000/flights/book/",
        data
      );

      if (response.status === 201) {
        setBookingSuccess(true);
        setBookingError(null); // Clear error message if successful
      } else {
        throw new Error("Booking failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setBookingError("Booking failed. Please try again."); // Store error message
    } finally {
      setSelectedFlight(null);
      setBooking(false);
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
                {segment.departure.terminal
                  ? `(T${segment.departure.terminal})`
                  : ""}
              </span>
              <span className="text-gray-500">→</span>
              <span>
                {segment.arrival.airport}
                {segment.arrival.terminal
                  ? `(T${segment.arrival.terminal})`
                  : ""}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{formatDateTime(segment.departure.time)}</span>
              <span className="text-xs">
                {formatDuration(segment.duration)}
              </span>
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
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <option key={num} value={num}>
                        {num} Passenger{num > 1 ? "s" : ""}
                      </option>
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
                  "Search Flights"
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
                      <div className="mt-4 text-right">
                        <Button
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                          onClick={() => openBookingModal(flight)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {selectedFlight && (
                  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-[600px] max-h-[90vh] overflow-y-auto">
                      <h2 className="text-2xl font-bold mb-4">
                        Confirm Your Booking
                      </h2>

                      {/* Flight Details */}
                      <div className="mb-4 border-b pb-4">
                        <p>
                          <strong>Departure:</strong> {formData.origin} (
                          {formData.departure_date})
                        </p>
                        <p>
                          <strong>Arrival:</strong> {formData.destination} (
                          {formData.return_date})
                        </p>
                        <p>
                          <strong>Price:</strong> {selectedFlight.price.total}{" "}
                          {selectedFlight.price.currency}
                        </p>
                      </div>

                      {/* Traveler Details */}
                      <div className="space-y-4 mb-6">
                        {travelersV2.map((traveler, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg">
                              Traveler {index + 1}
                            </h3>

                            {/* First Name */}
                            <Input
                              className="w-full mt-2"
                              type="text"
                              placeholder="First Name"
                              value={traveler.name.firstName}
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "name.firstName",
                                  e.target.value
                                )
                              }
                              required
                            />

                            {/* Last Name */}
                            <Input
                              className="w-full mt-2"
                              type="text"
                              placeholder="Last Name"
                              value={traveler.name.lastName}
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "name.lastName",
                                  e.target.value
                                )
                              }
                              required
                            />

                            {/* Date of Birth */}
                            <Input
                              className="w-full mt-2"
                              type="date"
                              placeholder="Date of Birth"
                              value={traveler.dateOfBirth}
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "dateOfBirth",
                                  e.target.value
                                )
                              }
                              required
                            />

                            {/* Gender */}
                            <select
                              className="w-full mt-2 p-2 border rounded-md"
                              value={traveler.gender}
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "gender",
                                  e.target.value
                                )
                              }
                              required
                            >
                              <option value="">Select Gender</option>
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                            </select>

                            {/* Email Address */}
                            <Input
                              className="w-full mt-2"
                              type="email"
                              placeholder="Email Address"
                              value={traveler.contact.emailAddress}
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "contact.emailAddress",
                                  e.target.value
                                )
                              }
                              required
                            />

                            {/* Phone Number */}
                            <Input
                              className="w-full mt-2"
                              type="text"
                              placeholder="Phone Number"
                              value={traveler.contact.phones[0].number}
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "contact.phones.0.number",
                                  e.target.value
                                )
                              }
                              required
                            />

                            {/* Country Code */}
                            <Input
                              className="w-full mt-2"
                              type="text"
                              placeholder="Country Code"
                              value={
                                traveler.contact.phones[0].countryCallingCode
                              }
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "contact.phones.0.countryCallingCode",
                                  e.target.value
                                )
                              }
                              required
                            />

                            {/* Passport Number */}
                            <Input
                              className="w-full mt-2"
                              type="text"
                              placeholder="Passport Number"
                              value={traveler.documents[0].number}
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "documents.0.number",
                                  e.target.value
                                )
                              }
                              required
                            />

                            {/* Document Type */}
                            <Input
                              className="w-full mt-2"
                              type="text"
                              placeholder="Document Type (e.g., PASSPORT)"
                              value={traveler.documents[0].documentType}
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "documents.0.documentType",
                                  e.target.value
                                )
                              }
                              required
                            />

                            {/* Birth Place */}
                            <Input
                              className="w-full mt-2"
                              type="text"
                              placeholder="Birth Place"
                              value={traveler.documents[0].birthPlace}
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "documents.0.birthPlace",
                                  e.target.value
                                )
                              }
                              required
                            />

                            {/* Issuance Location */}
                            <Input
                              className="w-full mt-2"
                              type="text"
                              placeholder="Issuance Location"
                              value={traveler.documents[0].issuanceLocation}
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "documents.0.issuanceLocation",
                                  e.target.value
                                )
                              }
                              required
                            />

                            {/* Issuance Date */}
                            <Input
                              className="w-full mt-2"
                              type="date"
                              placeholder="Issuance Date"
                              value={traveler.documents[0].issuanceDate}
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "documents.0.issuanceDate",
                                  e.target.value
                                )
                              }
                              required
                            />

                            {/* Expiry Date */}
                            <Input
                              className="w-full mt-2"
                              type="date"
                              placeholder="Expiry Date"
                              value={traveler.documents[0].expiryDate}
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "documents.0.expiryDate",
                                  e.target.value
                                )
                              }
                              required
                            />

                            {/* Issuance Country */}
                            <select
                              className="w-full mt-2 p-2 border rounded-md"
                              value={traveler.documents[0].issuanceCountry}
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "documents.0.issuanceCountry",
                                  e.target.value
                                )
                              }
                              required
                            >
                              <option value="">Select Issuance Country</option>
                              {COUNTRY_LIST.map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.name}
                                </option>
                              ))}
                            </select>

                            {/* Validity Country */}
                            <select
                              className="w-full mt-2 p-2 border rounded-md"
                              value={traveler.documents[0].validityCountry}
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "documents.0.validityCountry",
                                  e.target.value
                                )
                              }
                              required
                            >
                              <option value="">Select Validity Country</option>
                              {COUNTRY_LIST.map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.name}
                                </option>
                              ))}
                            </select>

                            {/* Nationality */}
                            <select
                              className="w-full mt-2 p-2 border rounded-md"
                              value={traveler.documents[0].nationality}
                              onChange={(e) =>
                                handleTravelerChangeV2(
                                  index,
                                  "documents.0.nationality",
                                  e.target.value
                                )
                              }
                              required
                            >
                              <option value="">Select Nationality</option>
                              {COUNTRY_LIST.map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.name}
                                </option>
                              ))}
                            </select>

                            {/* Holder (Boolean Field) */}
                            <div className="mt-2 flex items-center space-x-2">
                              <label className="font-medium">Holder:</label>
                              <input
                                type="checkbox"
                                checked={traveler.documents[0].holder}
                                onChange={(e) =>
                                  handleTravelerChangeV2(
                                    index,
                                    "documents.0.holder",
                                    e.target.checked
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Payment Information */}
                      <div className="space-y-4 mb-6 p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold">
                          Payment Details
                        </h3>
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
                          onChange={(e) =>
                            handlePaymentChange("cvv", e.target.value)
                          }
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
                      <h2 className="text-xl font-bold text-red-600">
                        Booking Failed
                      </h2>
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

                {bookingSuccess && (
                  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      <h2 className="text-lg font-bold text-green-600">
                        Booking Successful!
                      </h2>
                      <p>Your flight has been successfully booked.</p>
                      <button
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg"
                        onClick={() => setBookingSuccess(null)}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}

                {booking && (
                  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                      <svg
                        className="animate-spin h-8 w-8 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                      <p className="mt-4 text-gray-700">
                        Processing your booking...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlightSearch;
