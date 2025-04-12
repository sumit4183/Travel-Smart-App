"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

ChartJS.register(ArcElement, Tooltip, Legend);

const TripExpensePage = () => {
  const { tripId } = useParams();
  const [summary, setSummary] = useState<any>(null);
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Token ${token}` } };

  useEffect(() => {
    if (tripId) fetchData();
  }, [tripId]);

  const fetchData = async () => {
    try {
      const [summaryRes, expensesRes] = await Promise.all([
        axios.get(`http://localhost:8000/expenses/trips/${tripId}/summary/`, authHeader),
        axios.get(`http://localhost:8000/expenses/expenses/?trip=${tripId}`, authHeader),
      ]);
      setSummary(summaryRes.data);
      setExpenses(expensesRes.data);
      setLoading(false);
    } catch {
      setError("Failed to load trip data");
      setLoading(false);
    }
  };

  const getPieChartData = () => {
    if (!summary?.category_breakdown) return null;
    const labels = Object.keys(summary.category_breakdown);
    const data = Object.values(summary.category_breakdown);

    return {
      labels,
      datasets: [
        {
          label: "Expense Breakdown",
          data,
          backgroundColor: [
            "#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#6366f1", "#f472b6"
          ],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this expense?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:8000/expenses/expenses/${id}/`, authHeader);
      fetchData(); // Refresh
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setEditingExpense((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.patch(`http://localhost:8000/expenses/expenses/${editingExpense.id}/`, {
        ...editingExpense,
        amount: parseFloat(editingExpense.amount),
      }, authHeader);
      setEditingExpense(null);
      fetchData();
    } catch (err) {
      console.error("Failed to update", err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-8">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{summary.trip} Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p><strong>Budget:</strong> ${summary.budget}</p>
            <p><strong>Spent:</strong> ${summary.total_spent}</p>
            <p><strong>Remaining:</strong> ${summary.remaining}</p>
          </div>
          <div className="col-span-2">
            {getPieChartData() ? (
              <Pie data={getPieChartData()} />
            ) : (
              <p className="text-sm text-gray-500">No expense data to display chart.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Logged Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {expenses.map((exp: any) => (
                <li key={exp.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{exp.category} - ${exp.amount} {exp.currency}</p>
                    <p className="text-sm text-gray-500">{exp.date} — {exp.note || "No note"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingExpense(exp)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(exp.id)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No expenses logged yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-md shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Edit Expense</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <Input
                label="Amount"
                id="amount"
                type="number"
                value={editingExpense.amount}
                onChange={handleEditChange}
                required
              />
              <Input
                label="Currency"
                id="currency"
                type="text"
                value={editingExpense.currency}
                onChange={handleEditChange}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  id="category"
                  value={editingExpense.category}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="flights">Flights</option>
                  <option value="hotels">Hotels</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="shopping">Shopping</option>
                  <option value="misc">Miscellaneous</option>
                </select>
              </div>
              <Input
                label="Date"
                id="date"
                type="date"
                value={editingExpense.date}
                onChange={handleEditChange}
                required
              />
              <Input
                label="Note"
                id="note"
                type="text"
                value={editingExpense.note || ""}
                onChange={handleEditChange}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button type="submit">Save Changes</Button>
                <Button type="button" onClick={() => setEditingExpense(null)} className="bg-gray-500 hover:bg-gray-600">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripExpensePage;
