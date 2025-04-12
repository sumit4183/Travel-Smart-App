"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const NewTripPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    start_date: "",
    end_date: "",
    budget: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    
    let formattedValue = value;

    // Normalize to YYYY-MM-DD if the input is a date
    if (type === "date") {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        formattedValue = date.toISOString().split("T")[0]; // 'YYYY-MM-DD'
      }
    }

    setFormData((prev) => ({ ...prev, [id]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.post(
        "http://localhost:8000/expenses/trips/",
        {
          ...formData,
          budget: parseFloat(formData.budget),
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      router.push("/expenses"); // Redirect to main expense dashboard
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        console.error(err.response.data); // shows backend error messages
        setError(
          err.response.data?.[Object.keys(err.response.data)[0]]?.[0] ||
          "Failed to create trip. Please check your inputs."
        );
      } else {
        console.error(err);
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Trip</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Trip Name"
              id="name"
              type="text"
              placeholder="e.g. Japan 2025"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Destination"
              id="destination"
              type="text"
              placeholder="e.g. Tokyo"
              value={formData.destination}
              onChange={handleChange}
              required
            />
            <Input
              label="Start Date"
              id="start_date"
              type="date"
              placeholder=""
              value={formData.start_date}
              onChange={handleChange}
              required
            />
            <Input
              label="End Date"
              id="end_date"
              type="date"
              placeholder=""
              value={formData.end_date}
              onChange={handleChange}
              required
            />
            <Input
              label="Budget (USD)"
              id="budget"
              type="number"
              placeholder="e.g. 2000"
              value={formData.budget}
              onChange={handleChange}
              required
            />

            {error && <p className="text-red-500">{error}</p>}

            <Button type="submit">Create Trip</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTripPage;
