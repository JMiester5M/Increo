"use client"

import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

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
    <div className="space-y-8" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ 
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.875rem',
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: '0.375rem'
        }}>
          Profile Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
          Manage your account preferences and settings
        </p>
      </div>

      {/* Profile Picture */}
      <Card>
        <div className="flex flex-col items-center text-center">
          <div style={{ position: 'relative' }}>
            <img
              src={user?.photoURL || "/default-avatar.png"}
              alt={user?.displayName || "User"}
              style={{
                height: '112px',
                width: '112px',
                borderRadius: '50%',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
                border: '3px solid white',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #059669, #047857)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
              border: '2px solid white',
              fontSize: '0.875rem'
            }}>
              ✓
            </div>
          </div>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.375rem',
            fontWeight: '700',
            color: '#0F172A',
            marginTop: '1.25rem'
          }}>
            {user?.displayName}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.375rem', marginBottom: '1.25rem' }}>
            {user?.email}
          </p>
          <Button 
            variant="secondary" 
            style={{
              fontSize: '0.8125rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '10px'
            }}
          >
            Change Photo
          </Button>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <h2 className="text-heading-md text-gray-900 mb-6">Preferences</h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body font-medium text-gray-900">Email Notifications</p>
              <p className="text-body-sm text-gray-600">Receive updates about your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <div>
              <p className="text-body font-medium text-gray-900">Goal Reminders</p>
              <p className="text-body-sm text-gray-600">Get notified about upcoming deadlines</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <div>
              <p className="text-body font-medium text-gray-900">Spending Alerts</p>
              <p className="text-body-sm text-gray-600">Alerts when spending is high</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <div>
              <p className="text-body font-medium text-gray-900">Weekly Summary</p>
              <p className="text-body-sm text-gray-600">Get a weekly financial summary email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      </Card>
    </div>
  )
}
