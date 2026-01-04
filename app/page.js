"use client"

import { useState } from "react"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { useRouter } from "next/navigation"

export default function Home() {
  const [showSignIn, setShowSignIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Save user to database
      await fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          image: user.photoURL,
        }),
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error signing in:", error)
      alert("Failed to sign in. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white font-bold text-xl">
            I
          </div>
          <span className="text-2xl font-bold text-gray-900">Increo</span>
        </div>
        <button
          onClick={() => setShowSignIn(true)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Login
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl space-y-8">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Take Control of Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
              Financial Future
            </span>
          </h1>
          
          <div className="mx-auto max-w-2xl space-y-4">
            <p className="text-xl text-gray-600 leading-relaxed">
              Smart expense tracking that helps you understand your spending patterns
            </p>
            <p className="text-xl text-gray-600 leading-relaxed">
              Set meaningful goals and watch your progress in real-time
            </p>
            <p className="text-xl text-gray-600 leading-relaxed">
              AI-powered insights to help you save smarter
            </p>
          </div>

          <button
            onClick={() => setShowSignIn(true)}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Get Started
          </button>

          <p className="text-sm text-gray-500">
            Join thousands tracking their money and achieving their goals
          </p>
        </div>
      </main>

      {/* Sign In Modal */}
      {showSignIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <button
              onClick={() => setShowSignIn(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Welcome to Increo</h2>
                <p className="mt-2 text-gray-600">Sign in to start tracking your finances</p>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? "Signing in..." : "Continue with Google"}
              </button>

              <p className="text-center text-xs text-gray-500">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
