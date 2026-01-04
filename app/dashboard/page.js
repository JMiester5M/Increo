"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    monthlyExpenses: 0,
    monthlyIncome: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/goals").then(res => res.json()),
      fetch("/api/expenses").then(res => res.json()),
      fetch("/api/user/financial-info").then(res => res.json()),
    ])
      .then(([goals, expenses, financialInfo]) => {
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        const monthlyExpenses = expenses
          .filter(exp => {
            const expDate = new Date(exp.date)
            return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear
          })
          .reduce((sum, exp) => sum + exp.amount, 0)

        setStats({
          totalGoals: goals.length,
          completedGoals: goals.filter(g => g.completed).length,
          monthlyExpenses,
          monthlyIncome: financialInfo?.monthlyIncome || 0,
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  const remaining = stats.monthlyIncome - stats.monthlyExpenses

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(" ")[0] || "there"}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Here's your financial overview for this month
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Monthly Income</p>
            <span className="text-2xl">💰</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ${stats.monthlyIncome.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Total Expenses</p>
            <span className="text-2xl">💸</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ${stats.monthlyExpenses.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Remaining</p>
            <span className="text-2xl">💵</span>
          </div>
          <p className={`mt-2 text-3xl font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            ${remaining.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Active Goals</p>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalGoals - stats.completedGoals}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/goals"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
          >
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-medium text-gray-900">Create a Goal</p>
              <p className="text-sm text-gray-600">Set a new savings target</p>
            </div>
          </Link>

          <Link
            href="/spending"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">💳</span>
            <div>
              <p className="font-medium text-gray-900">Track Expense</p>
              <p className="text-sm text-gray-600">Log a new purchase</p>
            </div>
          </Link>

          <Link
            href="/survey"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-medium text-gray-900">Update Info</p>
              <p className="text-sm text-gray-600">Modify financial details</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
