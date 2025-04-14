"use client";

import React, { useState } from "react";
import axios from "axios";

type Props = {
  tripId: number;
  onExpenseAdded: () => void;
};

const AddExpenseForm: React.FC<Props> = ({ tripId, onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    currency: "USD",
    category: "Food",
    note: "",
    date: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setError("You must be signed in to add an expense.");
      setSubmitting(false);
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/expenses/", {
        ...formData,
        trip: tripId,
      }, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      setFormData({
        title: "",
        amount: "",
        currency: "USD",
        category: "Food",
        note: "",
        date: "",
      });

      onExpenseAdded(); // Refresh expenses
    } catch (err) {
      console.error("Failed to add expense:", err);
      setError("Failed to add expense. Please check your input.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
      {error && <p className="text-red-500">{error}</p>}

    <div>
      <label className="block text-sm font-medium text-gray-700" htmlFor="title">Title</label>
      <input
        type="text"
        id="title"
        name="title"
        className="w-full border p-2 rounded mt-1"
        value={formData.title}
        onChange={handleChange}
        required
        title="Title"
        placeholder="Enter a title"
      />
    </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            name="amount"
            className="w-full border p-2 rounded mt-1"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            placeholder="Enter amount"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <input
            type="text"
            name="currency"
            className="w-full border p-2 rounded mt-1"
            value={formData.currency}
            onChange={handleChange}
            placeholder="Enter currency (e.g., USD)"
            title="Currency"
            aria-label="Currency"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
        <select
          id="category"
          name="category"
          className="w-full border p-2 rounded mt-1"
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

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          name="date"
          className="w-full border p-2 rounded mt-1"
          value={formData.date}
          onChange={handleChange}
          required
          title="Date"
          placeholder="Select a date"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="note"
          className="w-full border p-2 rounded mt-1"
          value={formData.note}
          onChange={handleChange}
          rows={3}
          title="Notes"
          placeholder="Enter any additional notes"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        disabled={submitting}
      >
        {submitting ? "Adding..." : "Add Expense"}
      </button>
    </form>
  );
};

export default AddExpenseForm;
