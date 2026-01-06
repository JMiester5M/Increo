"use client"

import Image from "next/image"
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
            <Image
              src={user?.photoURL || "/default-avatar.svg"}
              alt={user?.displayName || "User"}
              width={112}
              height={112}
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = "/default-avatar.svg"
              }}
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
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#0F172A',
              marginBottom: '0.5rem',
            }}
          >
            Coming Soon
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#64748B' }}>
            Profile preferences and notification settings will live here.
          </p>
        </div>
      </Card>
    </div>
  )
}
