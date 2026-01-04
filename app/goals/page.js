"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"

export default function GoalsPage() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [user] = useAuthState(auth)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchGoals()
    }
  }, [user])

  const fetchGoals = async () => {
    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/goals", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setGoals(data)
    } catch (error) {
      console.error("Failed to fetch goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          targetAmount: parseFloat(formData.get("targetAmount")),
          deadline: formData.get("deadline") || null,
        }),
      })

      if (res.ok) {
        setShowCreate(false)
        fetchGoals()
      }
    } catch (error) {
      console.error("Failed to create goal:", error)
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
          <p className="mt-2 text-gray-600">Track your savings goals and progress</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-white font-medium hover:bg-emerald-600 transition-colors"
        >
          Create Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-6xl mb-4">🎯</span>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            It seems you haven't set any goals
          </h2>
          <p className="text-gray-600 mb-6">
            Why don't we get started on tracking your money!!
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-emerald-500 px-6 py-3 text-white font-medium hover:bg-emerald-600 transition-colors"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            return (
              <div
                key={goal.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                  {goal.completed && <span className="text-2xl">✅</span>}
                </div>

                {goal.description && (
                  <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                )}

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current</span>
                    <span className="font-medium text-gray-900">
                      ${goal.currentAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Target</span>
                    <span className="font-medium text-gray-900">
                      ${goal.targetAmount.toLocaleString()}
                    </span>
                  </div>

                  {goal.deadline && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Deadline</span>
                      <span className="font-medium text-gray-900">
                        {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Goal Modal */}
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

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Goal</h2>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g., Emergency Fund"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="What is this goal for?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount *
                </label>
                <input
                  type="number"
                  name="targetAmount"
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  name="deadline"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-white font-medium hover:bg-emerald-600 transition-colors"
              >
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
