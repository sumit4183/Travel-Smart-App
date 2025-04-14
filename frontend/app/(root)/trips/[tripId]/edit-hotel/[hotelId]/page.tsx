"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function EditHotelPage() {
  const { tripId, hotelId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    check_in: "",
    check_out: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/hotels/${hotelId}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setFormData(res.data);
      } catch (err) {
        setError("Failed to load hotel.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [hotelId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await axios.put(`http://localhost:8000/api/hotels/${hotelId}/`, {
        ...formData,
        trip: tripId,
      }, {
        headers: { Authorization: `Token ${token}` },
      });
      router.push(`/trips/${tripId}`);
    } catch (err) {
      setError("Failed to update hotel.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Hotel</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label className="text-sm block mb-1">Hotel Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm block mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm block mb-1">Check-in Date</label>
              <input
                type="date"
                name="check_in"
                value={formData.check_in}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="text-sm block mb-1">Check-out Date</label>
              <input
                type="date"
                name="check_out"
                value={formData.check_out}
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
              Update Hotel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
