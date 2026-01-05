"use client"

import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function StaffUsersPage() {
  const [user] = useAuthState(auth)
  const [isStaff, setIsStaff] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
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
          fetchUsers(token)
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

  const fetchUsers = async (token) => {
    try {
      const res = await fetch("/api/staff/users", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
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
          <div style={{ fontSize: '1.5rem' }}>👥</div>
          <h1 style={{ 
            fontFamily: 'Space Grotesk, sans-serif', 
            fontSize: '1.875rem', 
            fontWeight: '700',
            color: '#0F172A'
          }}>
            User Management
          </h1>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
          View and manage platform users
        </p>
      </div>

      {/* Users Table */}
      <div 
        style={{ 
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid #F1F5F9'
        }}
      >
        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
            No users found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: '#0F172A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Name
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: '#0F172A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Email
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: '#0F172A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Role
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: '#0F172A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Goals
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: '#0F172A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((userData) => (
                  <tr 
                    key={userData.id}
                    style={{ 
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#0F172A', fontWeight: '500' }}>
                      {userData.name || 'Unknown'}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748B' }}>
                      {userData.email}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: userData.role === 'staff' || userData.role === 'admin' ? '#FEF3C7' : '#F1F5F9',
                        color: userData.role === 'staff' || userData.role === 'admin' ? '#92400E' : '#475569'
                      }}>
                        {userData.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#059669', fontWeight: '600' }}>
                      {userData._count?.goals || 0}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748B' }}>
                      {new Date(userData.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
