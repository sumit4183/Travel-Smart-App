"use client";

import React, { useState } from "react";
import axios from "axios";

type Expense = {
  id: number;
  title: string;
  amount: string;
  currency: string;
  category: string;
  note: string;
  date: string;
};

type Props = {
  expense: Expense;
  onCancel: () => void;
  onUpdated: () => void;
};

const EditExpenseForm: React.FC<Props> = ({ expense, onCancel, onUpdated }) => {
  const [formData, setFormData] = useState({ ...expense });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setError("Not authenticated.");
      setSubmitting(false);
      return;
    }

    try {
      await axios.put(`http://localhost:8000/api/expenses/${expense.id}/`, formData, {
        headers: { Authorization: `Token ${token}` },
      });
      onUpdated();
    } catch (err) {
      console.error("Failed to update expense:", err);
      setError("Failed to update expense.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 border p-4 rounded">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            placeholder="Title"
            className="border p-2 rounded w-full"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            className="border p-2 rounded w-full"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <input
            type="text"
            name="currency"
            placeholder="Currency"
            className="border p-2 rounded w-full"
            value={formData.currency}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="border p-2 rounded w-full"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Flights">Flights</option>
            <option value="Hotels">Hotels</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Misc">Miscellaneous</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            placeholder="Select a date"
            className="border p-2 rounded w-full"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="note"
            placeholder="Notes"
            className="border p-2 rounded w-full"
            value={formData.note}
            onChange={handleChange}
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm px-4 py-1 border border-gray-300 rounded hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="text-sm bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default EditExpenseForm;
