"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Trip = {
  id: string;
  name: string;
  destination: string;
};

const NewExpensePage = () => {
  const router = useRouter();

  // const [trips, setTrips] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);

  const [formData, setFormData] = useState({
    trip: "",
    amount: "",
    currency: "USD",
    category: "",
    note: "",
    date: "",
  });

  // Fetch user's trips on mount
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/expenses/trips/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setTrips(response.data);
      } catch (err) {
        console.error("Failed to load trips", err);
        setError("Could not load your trips.");
      }
    };

    fetchTrips();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.post("http://localhost:8000/expenses/expenses/", {
        ...formData,
        amount: parseFloat(formData.amount),
      }, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      router.push("/expenses");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        console.error(err.response.data);
      } else {
        console.error("An unexpected error occurred", err);
      }
      setError("Failed to add expense. Please check your inputs.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Trip Selection */}
            <div>
              <label htmlFor="trip" className="block text-sm font-medium text-gray-700 mb-1">Trip</label>
              <select
                id="trip"
                value={formData.trip}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                aria-label="Select a trip"
              >
                <option value="">Select a trip</option>
                {trips.map((trip: Trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.name} ({trip.destination})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <Input
              label="Amount"
              id="amount"
              type="number"
              placeholder="e.g. 75.00"
              value={formData.amount}
              onChange={handleChange}
              required
            />

            {/* Currency */}
            <Input
              label="Currency"
              id="currency"
              type="text"
              placeholder="e.g. USD"
              value={formData.currency}
              onChange={handleChange}
              required
            />

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <label htmlFor="category" className="sr-only">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a category</option>
                <option value="flights">Flights</option>
                <option value="hotels">Hotels</option>
                <option value="food">Food</option>
                <option value="transport">Transport</option>
                <option value="shopping">Shopping</option>
                <option value="misc">Miscellaneous</option>
              </select>
            </div>

            {/* Date */}
            <Input
              label="Date"
              id="date"
              type="date"
              placeholder=""
              value={formData.date}
              onChange={handleChange}
              required
            />

            {/* Note */}
            <Input
              label="Note"
              id="note"
              type="text"
              placeholder="Optional note"
              value={formData.note}
              onChange={handleChange}
            />

            {error && <p className="text-red-500">{error}</p>}

            <Button type="submit">Add Expense</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewExpensePage;
