"use client"

import { useEffect, useState } from "react"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { useRouter } from "next/navigation"

export default function Home() {
  const [showSignIn, setShowSignIn] = useState(false)
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Give the home page a full-bleed green background without the light shell
    document.body.classList.add("home-hero-bg")
    document.documentElement.classList.add("home-hero-bg-root")

    return () => {
      document.body.classList.remove("home-hero-bg")
      document.documentElement.classList.remove("home-hero-bg-root")
    }
  }, [])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Check if user exists in database
      const checkResponse = await fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          checkOnly: true,
        }),
      })

      const { exists } = await checkResponse.json()

      if (!exists) {
        // User not registered - sign them out and show message
        await auth.signOut()
        alert("Account not found. Please sign up first to create an account.")
        setLoading(false)
        return
      }

      // User exists - proceed to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error signing in:", error)
      alert("Failed to sign in. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Check if user already exists
      const checkResponse = await fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          checkOnly: true,
        }),
      })

      const { exists } = await checkResponse.json()

      if (exists) {
        // User already registered - just log them in and go to dashboard
        setShowSignIn(false)
        router.push("/dashboard")
        setLoading(false)
        return
      }

      // Create new user account
      const createResponse = await fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          image: user.photoURL,
        }),
      })

      const createResult = await createResponse.json()
      
      if (!createResponse.ok) {
        console.error("Failed to create user:", createResult)
        throw new Error(createResult.error || "Failed to create user account")
      }

      console.log("User created successfully:", createResult)

      // Close modal and redirect to survey for new users
      setShowSignIn(false)
      router.push("/survey")
    } catch (error) {
      console.error("Error signing up:", error)
      // Sign out on error
      await auth.signOut()
      alert(`Failed to sign up: ${error.message}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #0F172A 100%)' }}>
      {/* Background effects */}
      <div className="absolute inset-0 opacity-100 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" 
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(5,150,105,0.3) 0%, transparent 50%)'
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-40 flex justify-center" style={{ padding: '1.5rem 4rem' }}>
        <span
          className="font-bold text-white"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            letterSpacing: '-0.5px',
            fontSize: '3.5rem'
          }}
        >
          Increo
        </span>
      </nav>

      {/* Hero Section */}
      <main className="relative text-center px-8 py-24 max-w-6xl mx-auto">
        <div className="space-y-12">
          <div className="space-y-6">
            <h1 
              className="text-7xl font-bold text-white leading-tight mb-6"
              style={{ 
                fontFamily: 'Space Grotesk, sans-serif',
                letterSpacing: '-2px',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                lineHeight: '1.1'
              }}
            >
              Track Your Money,<br/>Reach Your Goals
            </h1>
            <p className="text-2xl text-white font-normal leading-relaxed" style={{ opacity: 0.95, lineHeight: '1.6' }}>
              For people who want to take control of their financial future
            </p>
          </div>

          <button
            onClick={() => {
              setIsSignUpMode(true)
              setShowSignIn(true)
            }}
            className="transition-transform duration-200 ease-out"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              columnGap: '0.75rem',
              paddingInline: '40px',
              height: '52px',
              borderRadius: '999px',
              backgroundColor: '#FFFFFF',
              color: '#047857',
              fontSize: '1.05rem',
              fontWeight: 600,
              border: 'none',
              boxShadow: '0 10px 22px rgba(0, 0, 0, 0.18)',
              minWidth: '240px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 0, 0, 0.26)';
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = '0 10px 22px rgba(0, 0, 0, 0.18)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            <span style={{ letterSpacing: '0.02em' }}>Get Started</span>
            <span style={{ fontSize: '1.1rem', marginTop: '1px' }}>→</span>
          </button>
        </div>

        {/* Feature Cards */}
        <div
          className="flex flex-col items-center mx-auto px-6"
          style={{
            marginTop: '3.5rem',
            maxWidth: '720px',
            width: '100%',
            rowGap: '2.25rem'
          }}
        >
          {[
            { icon: '📊', title: 'Track Spending', desc: 'Easily categorize and monitor where your money goes each month' },
            { icon: '🎯', title: 'Set Goals', desc: 'Create savings goals and watch your progress with visual indicators' },
            { icon: '✨', title: 'Reach Milestones', desc: 'Get AI-powered insights and celebrate your financial wins' }
          ].map((feature, idx) => (
            <div 
              key={idx}
              className="rounded-3xl p-10 text-white text-center transition-all cursor-default"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: '24px',
                boxShadow: '0 14px 36px rgba(0, 0, 0, 0.12)',
                width: '100%',
                maxWidth: '720px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="text-5xl mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {feature.title}
              </h3>
              <p className="text-base leading-relaxed" style={{ opacity: 0.9 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-16">
          <p className="text-white text-lg mb-4" style={{ opacity: 0.9 }}>
            Already have an account?
          </p>
          <button
            onClick={() => {
              setIsSignUpMode(false)
              setShowSignIn(true)
            }}
            className="transition-transform duration-200 ease-out"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              columnGap: '0.75rem',
              paddingInline: '32px',
              height: '48px',
              borderRadius: '999px',
              backgroundColor: '#FFFFFF',
              color: '#047857',
              fontSize: '0.95rem',
              fontWeight: 600,
              border: 'none',
              boxShadow: '0 8px 18px rgba(0, 0, 0, 0.18)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 14px 26px rgba(0, 0, 0, 0.26)';
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 18px rgba(0, 0, 0, 0.18)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            <span style={{ letterSpacing: '0.02em' }}>Login</span>
            <span style={{ fontSize: '1.05rem', marginTop: '1px' }}>→</span>
          </button>
        </div>
      </main>

      {/* Sign In/Sign Up Modal */}
      {showSignIn && (
        <div 
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(15, 23, 42, 0.6)', 
            backdropFilter: 'blur(8px)'
          }}
        >
          <div 
            style={{ 
              position: 'relative',
              width: '100%',
              maxWidth: '440px', 
              borderRadius: '24px', 
              background: isSignUpMode 
                ? 'linear-gradient(135deg, #ECFDF5 0%, #ffffff 100%)'
                : 'white',
              padding: '3rem',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: isSignUpMode ? '2px solid #059669' : 'none'
            }}
          >
            <button
              onClick={() => {
                setShowSignIn(false)
                setIsSignUpMode(false)
              }}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F3F4F6',
                borderRadius: '8px',
                border: 'none',
                color: '#6B7280',
                fontSize: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#E5E7EB';
                e.currentTarget.style.color = '#111827';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
                e.currentTarget.style.color = '#6B7280';
              }}
            >
              ×
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Icon badge */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                marginBottom: '-0.5rem'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: isSignUpMode 
                    ? 'linear-gradient(135deg, #059669, #047857)'
                    : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}>
                  {isSignUpMode ? '🚀' : '👋'}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h2 style={{ 
                  fontFamily: 'Space Grotesk, sans-serif', 
                  fontSize: '1.875rem', 
                  fontWeight: '700',
                  color: '#0F172A',
                  marginBottom: '0.5rem'
                }}>
                  {isSignUpMode ? 'Create Your Account' : 'Welcome Back!'}
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                  {isSignUpMode 
                    ? 'Join Increo and start your financial journey today' 
                    : 'Log in to continue managing your finances'}
                </p>
              </div>

              <button
                onClick={isSignUpMode ? handleGoogleSignUp : handleGoogleSignIn}
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '12px',
                  border: isSignUpMode ? 'none' : '2px solid #E5E7EB',
                  background: isSignUpMode 
                    ? 'linear-gradient(135deg, #059669, #047857)'
                    : 'white',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: isSignUpMode ? 'white' : '#374151',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  transition: 'all 0.2s',
                  boxShadow: isSignUpMode ? '0 4px 12px rgba(5, 150, 105, 0.3)' : 'none'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    if (isSignUpMode) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.4)';
                    } else {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }
                  }
                }}
                onMouseOut={(e) => {
                  if (isSignUpMode) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
                  } else {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span style={{ color: isSignUpMode ? 'white' : 'inherit' }}>
                  {loading 
                    ? (isSignUpMode ? "Creating account..." : "Signing in...") 
                    : (isSignUpMode ? "Sign Up with Google" : "Continue with Google")}
                </span>
              </button>

              {isSignUpMode && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #D1FAE5'
                }}>
                  <p style={{ fontSize: '0.75rem', color: '#065F46', lineHeight: '1.5' }}>
                    ✨ By signing up, you'll get access to personalized financial tracking, goal setting, and AI-powered insights.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
                <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748B' }}>
                {isSignUpMode ? (
                  <>
                    Already have an account?{' '}
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault()
                        setIsSignUpMode(false)
                      }}
                      style={{ color: '#059669', fontWeight: '600', textDecoration: 'none', cursor: 'pointer' }}
                    >
                      Login here
                    </a>
                  </>
                ) : (
                  <>
                    Don't have an account?{' '}
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault()
                        setIsSignUpMode(true)
                      }}
                      style={{ color: '#059669', fontWeight: '600', textDecoration: 'none', cursor: 'pointer' }}
                    >
                      Sign up here
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
