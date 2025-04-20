"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

type Trip = {
  id: number;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: string;
  notes?: string;
};

type Flight = {
  id: number;
  airline: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  notes?: string;
};

type Hotel = {
  id: number;
  name: string;
  location: string;
  check_in: string;
  check_out: string;
  notes?: string;
};

export default function TripDetailPage() {
  const { tripId } = useParams();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;

  useEffect(() => {
    if (!tripId || !token) return;

    const fetchTripDetails = async () => {
      try {
        const headers = { Authorization: `Token ${token}` };

        const [tripRes, flightRes, hotelRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/trips/${tripId}/`, { headers }),
          axios.get(`http://localhost:8000/api/flights/?trip=${tripId}`, { headers }),
          axios.get(`http://localhost:8000/api/hotels/?trip=${tripId}`, { headers }),
        ]);

        setTrip(tripRes.data);
        setFlights(flightRes.data);
        setHotels(hotelRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load trip details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId, token]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/trips/${tripId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      router.push("/trips");
    } catch (err) {
      console.error("Failed to delete trip:", err);
      alert("Failed to delete trip.");
    }
  };

  const handleDeleteFlight = async (flightId: number) => {
    if (!confirm("Are you sure you want to delete this flight?")) return;
  
    try {
      await axios.delete(`http://localhost:8000/api/flights/${flightId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
  
      // Update local state
      setFlights((prev) => prev.filter((f) => f.id !== flightId));
    } catch (err) {
      console.error("Failed to delete flight.", err);
      alert("Failed to delete flight.");
    }
  };
  
  const handleDeleteHotel = async (hotelId: number) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return;
  
    try {
      await axios.delete(`http://localhost:8000/api/hotels/${hotelId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
  
      // Update local state
      setHotels((prev) => prev.filter((h) => h.id !== hotelId));
    } catch (err) {
      console.error("Failed to delete hotel.", err);
      alert("Failed to delete hotel.");
    }
  };  

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!trip) return <p className="p-4 text-gray-600">Trip not found.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{trip.name}</h1>
        <div className="flex space-x-2">
          <Link
            href={`/trips/${trip.id}/edit`}
            className="text-sm bg-yellow-200 px-3 py-1 rounded hover:bg-yellow-300"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="text-sm bg-red-200 px-3 py-1 rounded hover:bg-red-300"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-700 mb-6">
        <p>
          <strong>Destination:</strong> {trip.destination}
        </p>
        <p>
          <strong>Dates:</strong> {trip.start_date} → {trip.end_date}
        </p>
        <p>
          <strong>Budget:</strong> ${trip.budget}
        </p>
        {trip.notes && (
          <p>
            <strong>Notes:</strong> <em>{trip.notes}</em>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flights */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">✈️ Flights</h2>
            <Link
              href={`/trips/${trip.id}/add-flight`}
              className="text-xs text-blue-600 underline hover:text-blue-800"
            >
              + Add Flight
            </Link>
          </div>
          {flights.length ? (
            <ul className="space-y-3 text-sm text-gray-700">
              {flights.map((f) => (
                <li key={f.id} className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">
                      {f.airline} {f.flight_number}
                    </p>
                    <div className="flex space-x-2">
                      <Link
                        href={`/trips/${trip.id}/edit-flight/${f.id}`}
                        className="text-xs text-blue-600 underline hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteFlight(f.id)}
                        className="text-xs text-red-600 underline hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p>{f.departure_airport} → {f.arrival_airport}</p>
                  <p>Departure: {new Date(f.departure_time).toLocaleString()}</p>
                  <p>Arrival: {new Date(f.arrival_time).toLocaleString()}</p>
                  {f.notes && <p className="italic text-gray-500">Note: {f.notes}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No flights added yet.</p>
          )}
        </div>

        {/* Hotels */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">🏨 Hotels</h2>
            <Link
              href={`/trips/${trip.id}/add-hotel`}
              className="text-xs text-blue-600 underline hover:text-blue-800"
            >
              + Add Hotel
            </Link>
          </div>
          {hotels.length ? (
            <ul className="space-y-3 text-sm text-gray-700">
              {hotels.map((h) => (
                <li key={h.id} className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{h.name}</p>
                    <div className="flex space-x-2">
                      <Link
                        href={`/trips/${trip.id}/edit-hotel/${h.id}`}
                        className="text-xs text-blue-600 underline hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteHotel(h.id)}
                        className="text-xs text-red-600 underline hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p>Location: {h.location}</p>
                  <p>
                    Check-in: {new Date(h.check_in).toLocaleDateString()} • Check-out:{" "}
                    {new Date(h.check_out).toLocaleDateString()}
                  </p>
                  {h.notes && <p className="italic text-gray-500">Note: {h.notes}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No hotels added yet.</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link
          href={`/expenses/${trip.id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          View Expenses
        </Link>
      </div>
    </div>
  );
}
