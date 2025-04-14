"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function EditFlightPage() {
  const { tripId, flightId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    airline: "",
    flight_number: "",
    departure_airport: "",
    arrival_airport: "",
    departure_time: "",
    arrival_time: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/flights/${flightId}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setFormData(res.data);
      } catch (err) {
        setError("Failed to load flight.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlight();
  }, [flightId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await axios.put(`http://localhost:8000/api/flights/${flightId}/`, {
        ...formData,
        trip: tripId,
      }, {
        headers: { Authorization: `Token ${token}` },
      });
      router.push(`/trips/${tripId}`);
    } catch (err) {
      setError("Failed to update flight.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Flight</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label className="text-sm block mb-1">Airline</label>
            <input
              type="text"
              name="airline"
              value={formData.airline}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm block mb-1">Flight Number</label>
            <input
              type="text"
              name="flight_number"
              value={formData.flight_number}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm block mb-1">Departure Airport</label>
              <input
                type="text"
                name="departure_airport"
                value={formData.departure_airport}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="text-sm block mb-1">Arrival Airport</label>
              <input
                type="text"
                name="arrival_airport"
                value={formData.arrival_airport}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm block mb-1">Departure Time</label>
              <input
                type="datetime-local"
                name="departure_time"
                value={formData.departure_time}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="text-sm block mb-1">Arrival Time</label>
              <input
                type="datetime-local"
                name="arrival_time"
                value={formData.arrival_time}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm block mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={2}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update Flight
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
