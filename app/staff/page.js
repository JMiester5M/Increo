"use client"

import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function StaffDashboard() {
  const [user] = useAuthState(auth)
  const [isStaff, setIsStaff] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    completedGoals: 0,
    activeUsers: 0,
    inactiveUsers: 0
  })
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    const checkAccess = async () => {
      try {
        const token = await user.getIdToken()
        const res = await fetch("/api/staff/access", {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (res.ok) {
          setIsStaff(true)
          fetchStaffData(token)
        } else {
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Access check failed:", error)
        router.push("/dashboard")
      }
    }

    checkAccess()
  }, [user])

  const fetchStaffData = async (token) => {
    try {
      const res = await fetch("/api/staff/stats", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch staff data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !isStaff) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '1.5rem' }}>🛡️</div>
          <h1 style={{ 
            fontFamily: 'Space Grotesk, sans-serif', 
            fontSize: '1.875rem', 
            fontWeight: '700',
            color: '#0F172A'
          }}>
            Staff Dashboard
          </h1>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
          Overview and management tools
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div 
          style={{ 
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid #F1F5F9'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '1.25rem' }}>👥</div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#64748B',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Total Users
            </div>
          </div>
          <div style={{ 
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#059669'
          }}>
            {stats.totalUsers}
          </div>
        </div>

        <div 
          style={{ 
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid #F1F5F9'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '1.25rem' }}>✅</div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#64748B',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Completed Goals
            </div>
          </div>
          <div style={{ 
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#10B981'
          }}>
            {stats.completedGoals}
          </div>
        </div>

        <div 
          style={{ 
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid #F1F5F9'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '1.25rem' }}>�</div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#64748B',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Active (Past Week)
            </div>
          </div>
          <div style={{ 
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#3B82F6'
          }}>
            {stats.activeUsers}
          </div>
        </div>

        <div 
          style={{ 
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid #F1F5F9'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '1.25rem' }}>⚪</div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#64748B',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Inactive (Past Week)
            </div>
          </div>
          <div style={{ 
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#EF4444'
          }}>
            {stats.inactiveUsers}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          borderRadius: '16px',
          padding: '1.75rem',
          border: '1px solid #A7F3D0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
          <span style={{ fontSize: '2rem' }}>ℹ️</span>
          <div>
            <h3 style={{ 
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '1rem',
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: '0.375rem'
            }}>
              Staff Access
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#064E3B', lineHeight: '1.6' }}>
              You have staff-level access to view aggregated platform statistics and user data. 
              All data is anonymized and handled according to privacy policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
