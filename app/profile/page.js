"use client"

import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"

export default function ProfilePage() {
  const [user] = useAuthState(auth)
  const [financialInfo, setFinancialInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      user.getIdToken().then(token => {
        fetch("/api/user/financial-info", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            setFinancialInfo(data)
            setLoading(false)
          })
          .catch(() => setLoading(false))
      })
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">Manage your account and preferences</p>
      </div>

      {/* Profile Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.photoURL || "/default-avatar.png"}
              alt={user?.displayName || "User"}
              className="h-20 w-20 rounded-full"
            />
            <div>
              <p className="text-lg font-semibold text-gray-900">{user?.displayName}</p>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Member Since</h3>
            <p className="text-gray-900">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Financial Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Financial Information</h2>
          <a
            href="/survey"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Update
          </a>
        </div>

        {financialInfo?.surveyCompleted ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Income</span>
              <span className="font-semibold text-gray-900">
                ${financialInfo.monthlyIncome?.toLocaleString() || "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Survey Status</span>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                Completed
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Complete your financial survey to unlock all features
            </p>
            <a
              href="/survey"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-white font-medium hover:bg-emerald-600 transition-colors"
            >
              Complete Survey
            </a>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive updates about your goals</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <div>
              <p className="font-medium text-gray-900">Goal Reminders</p>
              <p className="text-sm text-gray-600">Get reminded about goal deadlines</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
