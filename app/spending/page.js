"use client"

import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"

const categories = {
  Food: ["Groceries", "Restaurants", "Coffee", "Other"],
  Transportation: ["Gas", "Public Transit", "Parking", "Other"],
  Housing: ["Rent", "Utilities", "Maintenance", "Other"],
  Entertainment: ["Movies", "Streaming", "Games", "Other"],
  Shopping: ["Clothing", "Electronics", "Other"],
  Healthcare: ["Doctor", "Pharmacy", "Insurance", "Other"],
  Other: ["Miscellaneous"],
}

export default function SpendingPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("Food")
  const [user] = useAuthState(auth)

  useEffect(() => {
    if (user) {
      fetchExpenses()
    }
  }, [user])

  const fetchExpenses = async () => {
    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setExpenses(data)
    } catch (error) {
      console.error("Failed to fetch expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateExpense = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)

    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: formData.get("category"),
          subcategory: formData.get("subcategory"),
          amount: parseFloat(formData.get("amount")),
          description: formData.get("description"),
          date: formData.get("date") || new Date().toISOString(),
        }),
      })

      if (res.ok) {
        setShowCreate(false)
        fetchExpenses()
      }
    } catch (error) {
      console.error("Failed to create expense:", error)
    }
  }

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = []
    }
    acc[expense.category].push(expense)
    return acc
  }, {})

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Spending</h1>
          <p className="mt-2 text-gray-600">Track and manage your expenses</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white font-medium hover:bg-blue-600 transition-colors"
        >
          Add Expense
        </button>
      </div>

      {/* Total Expenses Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Expenses</h2>
        <p className="text-4xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</p>
      </div>

      {/* Expenses by Category */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">By Category</h2>
        {Object.entries(expensesByCategory).map(([category, categoryExpenses]) => {
          const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
          return (
            <div key={category} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                <span className="text-lg font-bold text-gray-900">
                  ${categoryTotal.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                {categoryExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {expense.subcategory || category}
                      </p>
                      {expense.description && (
                        <p className="text-sm text-gray-600">{expense.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ${expense.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {Object.keys(expensesByCategory).length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-gray-200 bg-white">
            <span className="text-6xl mb-4">💳</span>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No expenses tracked yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start tracking your spending to see insights
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-lg bg-blue-500 px-6 py-3 text-white font-medium hover:bg-blue-600 transition-colors"
            >
              Add First Expense
            </button>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <button
              onClick={() => setShowCreate(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Expense</h2>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {Object.keys(categories).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  name="subcategory"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {categories[selectedCategory].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="25.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="What was this for?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white font-medium hover:bg-blue-600 transition-colors"
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
