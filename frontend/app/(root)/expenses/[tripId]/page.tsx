"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

import AddExpenseForm from "@/components/expenses/AddExpenseForm";
import ExpenseList from "@/components/expenses/ExpenseList";

type Trip = {
  id: number;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: string;
};

type Expense = {
  id: number;
  title: string;
  amount: string;
  currency: string;
  category: string;
  note: string;
  date: string;
};

type Summary = {
  trip: string;
  budget: number;
  total_spent: number;
  remaining: number;
  category_breakdown: Record<string, number>;
};

const TripExpensePage = () => {
  const router = useRouter();
  const { tripId } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token") || sessionStorage.getItem("token")
    : null;

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        const [tripRes, expensesRes, summaryRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/trips/${tripId}/`, {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get(`http://localhost:8000/api/trips/${tripId}/expenses/`, {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get(`http://localhost:8000/api/trips/${tripId}/summary/`, {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);

        setTrip(tripRes.data);
        setExpenses(expensesRes.data);
        setSummary(summaryRes.data);
      } catch (error) {
        console.error("Error fetching trip data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tripId]);

  const refreshExpenses = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/trips/${tripId}/expenses/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setExpenses(res.data);
  
      const summaryRes = await axios.get(`http://localhost:8000/api/trips/${tripId}/summary/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setSummary(summaryRes.data);
    } catch (err) {
      console.error("Failed to refresh expenses:", err);
    }
  };  

  return (
    <div className="min-h-screen bg-white p-6 max-w-5xl mx-auto">
      {loading && <p>Loading trip...</p>}
      {!loading && trip && (
        <>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{trip.name}</h1>
          <p className="text-gray-600 mb-4">
            {trip.destination} — {trip.start_date} to {trip.end_date}
          </p>
          <p className="text-gray-700 mb-6">Budget: ${trip.budget}</p>

          {summary && (
            <div className="bg-gray-100 p-4 rounded mb-6">
              <h2 className="text-xl font-semibold mb-2">Summary</h2>
              <p>Total Spent: ${summary.total_spent.toFixed(2)}</p>
              <p>Remaining: ${summary.remaining.toFixed(2)}</p>
              <h3 className="mt-3 font-medium">By Category:</h3>
              <ul className="ml-4 list-disc">
                {Object.entries(summary.category_breakdown).map(([cat, amount]) => (
                  <li key={cat}>
                    {cat}: ${amount.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Placeholder for AddExpenseForm */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Add New Expense</h2>
            <AddExpenseForm tripId={Number(tripId)} onExpenseAdded={refreshExpenses} />
          </div>

          {/* Placeholder for ExpenseList */}
          <div>
            {/* <h2 className="text-xl font-semibold mb-2">All Expenses</h2> */}
            <ExpenseList expenses={expenses} onDelete={refreshExpenses} />

          </div>
        </>
      )}
    </div>
  );
};

export default TripExpensePage;
