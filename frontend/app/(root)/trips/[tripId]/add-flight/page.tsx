"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export default function AddFlightToTripPage() {
  const router = useRouter();
  const { tripId } = useParams();

  const [formData, setFormData] = useState({
    airline: "",
    flight_number: "",
    departure_airport: "",
    arrival_airport: "",
    departure_time: "",
    arrival_time: "",
    notes: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    setError(null);

    try {
      await axios.post(
        "http://localhost:8000/api/flights/",
        {
          ...formData,
          trip: tripId,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      router.push(`/trips/${tripId}`);
    } catch (err) {
      console.error("Error creating flight:", err);
      setError("Failed to create flight.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-20 py-12 p-6 rounded">
      <h1 className="text-2xl font-bold mb-4">Add Flight to Trip</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Airline</label>
            <input
              type="text"
              name="airline"
              value={formData.airline}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="e.g., Delta"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Flight No.</label>
            <input
              type="text"
              name="flight_number"
              value={formData.flight_number}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="e.g., DL123"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Departure Airport</label>
            <input
              type="text"
              name="departure_airport"
              value={formData.departure_airport}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="e.g., JFK"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Arrival Airport</label>
            <input
              type="text"
              name="arrival_airport"
              value={formData.arrival_airport}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="e.g., LAX"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Departure Time</label>
            <input
              type="datetime-local"
              name="departure_time"
              value={formData.departure_time}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Select departure time"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Arrival Time</label>
            <input
              type="datetime-local"
              name="arrival_time"
              value={formData.arrival_time}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Select arrival time"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            placeholder="Add any special notes"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Flight"}
          </button>
        </div>
      </form>

    </div>
  );
}
