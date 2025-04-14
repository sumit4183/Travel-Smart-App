"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const CreateTripPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    start_date: "",
    end_date: "",
    budget: "",
    notes: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setError("You must be signed in to create a trip.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/trips/", formData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const newTrip = response.data;
      router.push(`/expenses/${newTrip.id}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Axios error:", err.response?.data || err.message);
      } else {
        console.error("Unexpected error:", err);
      }
      setError("Failed to create trip. Please check your inputs.");
      console.error("Trip creation error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto py-12 mt-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create a New Trip</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Trip Name</label>
          <input
            type="text"
            name="name"
            className="w-full border p-2 rounded mt-1"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter the trip name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Destination</label>
          <input
            type="text"
            name="destination"
            className="w-full border p-2 rounded mt-1"
            value={formData.destination}
            onChange={handleChange}
            placeholder="Enter the destination"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="start_date"
              className="w-full border p-2 rounded mt-1"
              value={formData.start_date}
              onChange={handleChange}
              placeholder="Select start date"
              title="Select the start date for your trip"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
                type="date"
                name="end_date"
                className="w-full border p-2 rounded mt-1"
                value={formData.end_date}
                onChange={handleChange}
                placeholder="Select end date"
                title="Select the end date for your trip"
                required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Budget (USD)</label>
          <input
            type="number"
            name="budget"
            className="w-full border p-2 rounded mt-1"
            value={formData.budget}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="Enter your budget in USD"
            title="Enter the budget for your trip"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea
            name="notes"
            className="w-full border p-2 rounded mt-1"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            title="Add any additional notes for your trip"
            placeholder="Enter any additional notes here"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Trip"}
        </button>
      </form>
    </div>
  );
};

export default CreateTripPage;
