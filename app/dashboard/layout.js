"use client"

import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function DashboardLayout({ children }) {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()
  const pathname = usePathname()
  const [surveyCompleted, setSurveyCompleted] = useState(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
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
  }, [user])

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

  if (!user) {
    return null
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/goals", label: "Goals", icon: "🎯" },
    { href: "/spending", label: "Spending", icon: "💳" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 text-white font-bold">
            I
          </div>
          <span className="text-xl font-bold text-gray-900">Increo</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user.photoURL || "/default-avatar.png"}
              alt={user.displayName || "User"}
              className="h-10 w-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {!surveyCompleted && surveyCompleted !== null && pathname !== "/survey" && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
            <p className="text-sm text-yellow-800">
              📊 Complete your{" "}
              <Link href="/survey" className="font-medium underline">
                financial survey
              </Link>{" "}
              to unlock all features
            </p>
          </div>
        )}
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
