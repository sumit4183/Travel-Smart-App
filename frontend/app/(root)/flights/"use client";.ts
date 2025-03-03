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

export interface User {
  id: number;
  email: string;
  phone_number?: string;
  date_of_birth?: string; // ISO format (YYYY-MM-DD)
  address?: string;
  preferred_language?: string;
  failed_login_attempts: number;
  account_locked_until?: string; // ISO format (YYYY-MM-DD HH:MM:SS)
  travel_preferences?: string;
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
  const [user, setUser] = useState<User | null>(null);
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

  React.useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get("http://localhost:8000/auth/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("User not authenticated:", error);
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  // Updates the traveler information based on the number of adults and kids
  // React.useEffect(() => {
  //   const totalTravelers = adults + kids;
  //   setTravelers(
  //     Array.from({ length: totalTravelers }, () => ({
  //       firstName: "",
  //       lastName: "",
  //       dateOfBirth: "",
  //     }))
  //   );
  // }, [adults, kids]);

  // Updates the traveler information based on the number of adults and kids
  React.useEffect(() => {
    const totalTravelers = adults + kids;
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
  // Handles changes in the payment information fields
  const handlePaymentChange = (field: string, value: string) => {
    setPayment({ ...payment, [field]: value });
  };

  // Opens the booking modal with the selected flight information
  const openBookingModal = (flight: Flight) => {
    console.log(flight);
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
      console.log(response.data);
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
    // if (!selectedFlight || !user) {
    //   setBookingError("You must be logged in to book a flight.");
    //   return;
    // }

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
      const data = {
        flight: selectedFlight,
        traveler: travelersV2,
      };
      console.log(selectedFlight);
      console.log(travelersV2);

      console.log(token);
      // const response = await axios.post("http://localhost:8000/flights/book/", {
      //   user_id: user?.id,
      //   departure: formData.departure,
      //   arrival: formData.arrival,
      //   departureDate: formData.departureDate,
      //   arrivalDate: formData.arrivalDate,
      //   price: selectedFlight?.price.total,
      //   currency: selectedFlight?.price.currency,
      //   adults: adults,
      //   kids: kids,
      //   travelers: travelers,
      //   paymentToken: token, // Send only the token, not raw card data
      // });
      const response = await axios.post(
        "http://localhost:8000/flights/book/",
        data
      );
      console.log(response);

      // if (response.status === 200) {
      //   setBookingSuccess(true);
      //   setBookingError(null); // Clear error message if successful
      // } else {
      //   throw new Error("Booking failed. Please try again.");
      // }
    } catch (error) {
      setBookingError("Booking failed. Please try again."); // Store error message
    } finally {
      setSelectedFlight(null);
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
                  <Input
                    className="w-full mt-2"
                    type="text"
                    placeholder="Gender"
                    value={traveler.gender}
                    onChange={(e) =>
                      handleTravelerChangeV2(index, "gender", e.target.value)
                    }
                    required
                  />

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
                    value={traveler.contact.phones[0].countryCallingCode}
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
                  <Input
                    className="w-full mt-2"
                    type="text"
                    placeholder="Issuance Country"
                    value={traveler.documents[0].issuanceCountry}
                    onChange={(e) =>
                      handleTravelerChangeV2(
                        index,
                        "documents.0.issuanceCountry",
                        e.target.value
                      )
                    }
                    required
                  />

                  {/* Validity Country */}
                  <Input
                    className="w-full mt-2"
                    type="text"
                    placeholder="Validity Country"
                    value={traveler.documents[0].validityCountry}
                    onChange={(e) =>
                      handleTravelerChangeV2(
                        index,
                        "documents.0.validityCountry",
                        e.target.value
                      )
                    }
                    required
                  />

                  {/* Nationality */}
                  <Input
                    className="w-full mt-2"
                    type="text"
                    placeholder="Nationality"
                    value={traveler.documents[0].nationality}
                    onChange={(e) =>
                      handleTravelerChangeV2(
                        index,
                        "documents.0.nationality",
                        e.target.value
                      )
                    }
                    required
                  />

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
