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
  notes?: string;
};

type Summary = {
  total_spent: number;
  remaining: number;
};

export default function TripsDashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [summaries, setSummaries] = useState<Record<number, Summary>>({});
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token") || sessionStorage.getItem("token")
    : null;

  useEffect(() => {
    if (!token) return;

    const fetchTripsAndDetails = async () => {
      try {
        const headers = { Authorization: `Token ${token}` };

        // Fetch trips
        const tripRes = await axios.get("http://localhost:8000/api/trips/", { headers });
        setTrips(tripRes.data);

        // Fetch summaries
        const summaryData: Record<number, Summary> = {};
        await Promise.all(
          tripRes.data.map(async (trip: Trip) => {
            const res = await axios.get(`http://localhost:8000/api/trips/${trip.id}/summary/`, { headers });
            summaryData[trip.id] = {
              total_spent: res.data.total_spent,
              remaining: res.data.remaining,
            };
          })
        );
        setSummaries(summaryData);
      } catch (err) {
        console.error("Failed to load trip data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTripsAndDetails();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Trips</h1>
          <Link href="/create-trip" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            + New Trip
          </Link>
        </div>

        {loading ? (
          <p>Loading trips...</p>
        ) : trips.length === 0 ? (
          <p className="text-gray-500">You haven’t created any trips yet.</p>
        ) : (
          <div className="space-y-6">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white p-6 rounded shadow border space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-800">{trip.name}</h2>
                  <div className="flex space-x-2">
                    <Link href={`/expenses/${trip.id}`} className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Expenses</Link>
                    <Link href={`/trips/${trip.id}`} className="text-sm bg-blue-100 px-3 py-1 rounded hover:bg-blue-200">View Details</Link>
                  </div>
                </div>

                <p className="text-gray-600 text-sm">
                  {trip.destination} — {trip.start_date} to {trip.end_date}
                </p>

                <div className="text-sm text-gray-700">
                  <p>
                    Budget: ${trip.budget} • Spent: ${summaries[trip.id]?.total_spent?.toFixed(2) ?? 0} • Remaining: ${summaries[trip.id]?.remaining?.toFixed(2) ?? trip.budget}
                  </p>
                  {trip.notes && <p className="text-gray-500 mt-1"><em>Note: {trip.notes}</em></p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
