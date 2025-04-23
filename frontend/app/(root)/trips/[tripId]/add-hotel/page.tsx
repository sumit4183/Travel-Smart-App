"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export default function AddHotelToTripPage() {
  const router = useRouter();
  const { tripId } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    check_in: "",
    check_out: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await axios.post(
        "http://localhost:8000/api/hotels/",
        {
          ...formData,
          trip: tripId,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      router.push(`/trips/${tripId}`);
    } catch (err) {
      console.error("Failed to save hotel:", err);
      setError("Failed to save hotel.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-20 py-12 p-6 rounded">

      <h1 className="text-2xl font-bold mb-4">Add Hotel to Trip</h1>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hotel Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="e.g., Hilton Downtown"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="e.g., New York, NY"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Check-In</label>
            <input
              type="date"
              name="check_in"
              value={formData.check_in}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              title="Select check-in date"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Check-Out</label>
            <input
              type="date"
              name="check_out"
              value={formData.check_out}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              title="Select check-out date"
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
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            rows={2}
            placeholder="Any additional info or confirmation number"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Hotel"}
          </button>
        </div>
      </form>
    </div>
  );
}
