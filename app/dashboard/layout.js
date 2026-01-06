"use client"

import Image from "next/image"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useStaffAccess } from "@/lib/useStaffAccess"

export default function DashboardLayout({ children }) {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()
  const pathname = usePathname()
  const [surveyCompleted, setSurveyCompleted] = useState(null)
  const [userExists, setUserExists] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isStaff } = useStaffAccess()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      // Check if user exists in database
      fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          checkOnly: true,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (!data.exists) {
            // User not in database, sign them out
            signOut(auth).then(() => {
              router.push("/")
            })
          } else {
            setUserExists(true)
            // Check if user has completed survey
            user.getIdToken().then(token => {
              fetch("/api/user/financial-info", {
                headers: { Authorization: `Bearer ${token}` },
              })
                .then(res => res.json())
                .then(data => {
                  setSurveyCompleted(data?.surveyCompleted || false)
                })
                .catch(() => setSurveyCompleted(false))
            })
          }
        })
        .catch(() => {
          signOut(auth).then(() => {
            router.push("/")
          })
        })
    }
  }, [user, router])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!user || userExists === false) {
    return null
  }

  if (userExists === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/goals", label: "Goals", icon: "🎯" },
    { href: "/spending", label: "Spending", icon: "💳" },
    { href: "/my-info", label: "My Info", icon: "📊" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ]

  if (isStaff) {
    navItems.push(
      { href: "/dashboard/staff", label: "Staff Dashboard", icon: "🛡️" },
      { href: "/dashboard/staff/users", label: "Users", icon: "👥" }
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
      {/* Sidebar */}
      <div 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ 
          background: 'radial-gradient(circle at top left, #ECFDF5 0%, #E5E7EB 40%, #F9FAFB 100%)',
          boxShadow: sidebarOpen ? '0 20px 45px rgba(15, 23, 42, 0.35)' : 'none',
          borderRight: '1px solid rgba(148, 163, 184, 0.35)',
          height: 'calc(100vh - 20px)',
          marginTop: '10px',
          marginBottom: '10px',
          borderRadius: '0 20px 20px 0',
          overflowX: 'hidden',
          overflowY: 'auto',
          visibility: sidebarOpen ? 'visible' : 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Sidebar Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#0F172A'
                }}
              >
                Increo
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#6B7280',
                  fontWeight: 500
                }}
              >
                Financial Hub
              </span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="transition-transform duration-150 ease-out"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '999px',
                border: '1px solid rgba(148, 163, 184, 0.6)',
                background: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.12)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 5px rgba(15, 23, 42, 0.16)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.12)';
              }}
            >
              <span className="text-sm" style={{ color: '#0F172A', fontWeight: 600 }}>✕</span>
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 pt-4 pb-6 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-white/90 text-emerald-600 font-semibold shadow-sm' 
                      : 'text-gray-700 hover:bg-white/70 hover:text-emerald-600'
                  }`}
                >
                  <span className="text-xl">
                    {item.icon}
                  </span>
                  <span className="font-medium tracking-tight">
                    {item.label}
                  </span>
                  {isActive && (
                    <span
                      className="ml-auto h-6 w-1 rounded-full bg-emerald-500 group-hover:bg-emerald-600"
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="px-6 py-5 flex-shrink-0" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
          <div className="flex flex-col gap-1" style={{ maxWidth: '100%' }}>
            <div 
              className="font-medium text-gray-900"
              style={{ 
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                lineHeight: '1.3'
              }}
            >
              {user?.displayName || 'User'}
            </div>
            <div 
              className="text-gray-500"
              style={{ 
                fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                lineHeight: '1.3'
              }}
            >
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white sticky top-0 z-30" style={{ padding: '1.5rem 2.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: '2rem' }}>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center rounded-xl transition-all"
              style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)',
                border: '1px solid #CBD5E1',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #E2E8F0, #CBD5E1)'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #F1F5F9, #E2E8F0)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              <span style={{ fontSize: '1.25rem', color: '#475569' }}>☰</span>
            </button>
            <div className="flex items-center gap-2">
              <span style={{ 
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#059669',
                fontFamily: 'Space Grotesk, sans-serif'
              }}>
                Increo
              </span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user?.displayName || "User"}
                width={44}
                height={44}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = "/default-avatar.svg"
                }}
                className="rounded-full cursor-pointer"
                style={{ 
                  width: '44px',
                  height: '44px',
                  objectFit: 'cover',
                  border: '2px solid #059669'
                }}
              />
            ) : (
              <div 
                className="rounded-full flex items-center justify-center text-white font-semibold cursor-pointer"
                style={{ 
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  fontSize: '1.125rem'
                }}
              >
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <button
              onClick={handleSignOut}
              style={{
                padding: '0.625rem 1.25rem',
                border: 'none',
                background: 'linear-gradient(135deg, #EF4444, #B91C1C)',
                borderRadius: '999px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: '#FFFFFF',
                boxShadow: '0 8px 18px rgba(239, 68, 68, 0.35)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626, #7F1D1D)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(185, 28, 28, 0.45)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #EF4444, #B91C1C)'
                e.currentTarget.style.boxShadow = '0 8px 18px rgba(239, 68, 68, 0.35)'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Survey Banner */}
      {!surveyCompleted && surveyCompleted !== null && pathname !== "/survey" && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <p className="text-sm font-medium text-amber-900">
              Complete your{" "}
              <Link href="/survey" className="font-bold underline hover:text-amber-700 transition-colors">
                financial survey
              </Link>{" "}
              to unlock personalized insights and all features
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">{children}</main>
    </div>
  )
}
