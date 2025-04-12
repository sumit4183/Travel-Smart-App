"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const TripExpensePage = () => {
  const { tripId } = useParams();
  const [summary, setSummary] = useState<any>(null);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Token ${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, expensesRes] = await Promise.all([
          axios.get(`http://localhost:8000/expenses/trips/${tripId}/summary/`, authHeader),
          axios.get(`http://localhost:8000/expenses/expenses/?trip=${tripId}`, authHeader),
        ]);
        setSummary(summaryRes.data);
        setExpenses(expensesRes.data);
      } catch {
        setError("Failed to load trip data");
      }
    };
    if (tripId) fetchData();
  }, [tripId]);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Trip Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {summary && (
            <div className="mb-6">
              <p><strong>Trip:</strong> {summary.trip}</p>
              <p><strong>Budget:</strong> ${summary.budget}</p>
              <p><strong>Spent:</strong> ${summary.total_spent}</p>
              <p><strong>Remaining:</strong> ${summary.remaining}</p>
              <p><strong>Breakdown:</strong></p>
              <ul className="ml-4 list-disc">
                {Object.entries(summary.category_breakdown).map(([cat, amt]) => (
                  <li key={cat}>
                    {cat}: ${amt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {expenses.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Expenses</h3>
              <ul className="space-y-2">
                {expenses.map((exp: any) => (
                  <li key={exp.id} className="border-b pb-2">
                    {exp.category} - ${exp.amount} {exp.currency} on {exp.date} - {exp.note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default TripExpensePage;
