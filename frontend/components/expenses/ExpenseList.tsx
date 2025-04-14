"use client";

import React, { useState } from "react";
import axios from "axios";

import EditExpenseForm from "@/components/expenses/EditExpenseForm";

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
    expenses: Expense[];
    onDelete: () => void; // trigger to refresh list after delete
  };
  

const ExpenseList: React.FC<Props> = ({ expenses, onDelete }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingId, setEditingId] = useState<number | null>(null);

  const categories = ["All", ...new Set(expenses.map((e) => e.category))];
  const filteredExpenses =
    selectedCategory === "All"
      ? expenses
      : expenses.filter((e) => e.category === selectedCategory);

  const handleDelete = async (expenseId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this expense?");
    if (!confirmed) return;
  
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;
  
    try {
      await axios.delete(`http://localhost:8000/api/expenses/${expenseId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      onDelete(); // Refresh parent state
    } catch (err) {
      console.error("Failed to delete expense:", err);
      alert("Failed to delete expense.");
    }
  };
      
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 className="text-xl font-semibold text-gray-800">All Expenses</h3>
        <label htmlFor="category-select" className="sr-only">
          Filter by category
        </label>
        <select
          id="category-select"
          className="border p-2 rounded bg-white shadow-sm"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {filteredExpenses.length === 0 ? (
        <p className="text-gray-500">No expenses found for this category.</p>
      ) : (
        <ul className="space-y-4">
          {filteredExpenses.map((expense) => (
            <li
              key={expense.id}
              className="border border-gray-200 bg-white p-4 rounded shadow-sm"
            >
              {editingId === expense.id ? (
                <EditExpenseForm
                  expense={expense}
                  onCancel={() => setEditingId(null)}
                  onUpdated={() => {
                    setEditingId(null);
                    onDelete(); // reuse to refresh
                  }}
                />
              ) : (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">{expense.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-green-700">
                        {expense.amount} {expense.currency}
                      </span>
                      <button
                        onClick={() => setEditingId(expense.id)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{expense.category} | {expense.date}</p>
                  {expense.note && <p className="text-gray-700 text-sm">{expense.note}</p>}
                </>
              )}
            </li>          
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExpenseList;
