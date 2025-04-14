"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

type Trip = {
  id: number;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: string;
};

const ExpenseTripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:8000/api/trips/", {
          headers: { Authorization: `Token ${token}` },
        });
        setTrips(response.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error("Failed to fetch trips:", err.response?.data || err.message);
        } else {
          console.error("Failed to fetch trips:", err);
        }
        console.error("Failed to fetch trips:", err);
        setError("Failed to fetch trips.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Select a Trip to Track Expenses</h1>
          <Link href="/create-trip">
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
              + Create New Trip
            </button>
          </Link>
        </div>


        {loading && <p>Loading trips...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between border"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{trip.name}</h2>
                <p className="text-gray-600 text-sm mb-1">
                  <span className="font-medium">Destination:</span> {trip.destination}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  <span className="font-medium">Dates:</span> {trip.start_date} → {trip.end_date}
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  <span className="font-medium">Budget:</span> ${trip.budget}
                </p>
              </div>
              <Link
                href={`/expenses/${trip.id}`}
                className="mt-4 inline-block bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition"
              >
                Track Expenses
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseTripsPage;
