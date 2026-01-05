"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ProgressBar } from "@/components/ui/ProgressBar"

export default function GoalsPage() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [user] = useAuthState(auth)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchGoals()
    }
  }, [user])

  const fetchGoals = async () => {
    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/goals", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setGoals(data)
    } catch (error) {
      console.error("Failed to fetch goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          targetAmount: parseFloat(formData.get("targetAmount")),
          deadline: formData.get("deadline") || null,
        }),
      })

      if (res.ok) {
        setShowCreate(false)
        fetchGoals()
      }
    } catch (error) {
      console.error("Failed to create goal:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 style={{ 
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#0F172A',
            marginBottom: '0.375rem'
          }}>
            Goals
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Track your savings goals and milestones
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(5, 150, 105, 0.25)'
          }}
        >
          <span style={{ fontSize: '1.125rem' }}>+</span>
          Add Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div 
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '3rem 2rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid #F1F5F9',
            textAlign: 'center'
          }}
        >
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🎯</span>
          <h2 style={{ 
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#0F172A',
            marginBottom: '0.625rem'
          }}>
            No Goals Yet
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#64748B', marginBottom: '1.5rem', maxWidth: '28rem', margin: '0 auto 1.5rem' }}>
            Why don't we get started on tracking your money!
          </p>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Create Goal
          </button>
          
          <div 
            style={{ 
              marginTop: '3rem',
              maxWidth: '42rem',
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              border: '1px solid #F1F5F9'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>💡</span>
              <div>
                <h3 style={{ 
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#0F172A',
                  marginBottom: '0.375rem'
                }}>
                  AI Suggestions
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                  "Based on your spending, you could save $150/month for a vacation fund..."
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100
              const daysRemaining = goal.deadline 
                ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                : null

              return (
                <div
                  key={goal.id}
                  onClick={() => router.push(`/goals/${goal.id}`)}
                  className="bg-white cursor-pointer card-hover"
                  style={{
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    border: '1px solid #F1F5F9',
                    borderLeft: '3px solid #059669',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: '#0F172A',
                        marginBottom: '0.25rem'
                      }}>
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.375rem' }}>
                          {goal.description}
                        </p>
                      )}
                    </div>
                    {goal.completed && (
                      <div style={{
                        fontSize: '1.25rem',
                        background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '0.75rem',
                        flexShrink: 0
                      }}>
                        ✓
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8125rem', color: '#64748B' }}>
                    <span>Started: {new Date(goal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    {goal.deadline && (
                      <span style={{ color: daysRemaining < 7 ? '#F97316' : '#64748B', fontWeight: daysRemaining < 7 ? '600' : 'normal' }}>
                        Target: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: '700', color: '#059669' }}>
                        ${goal.currentAmount.toLocaleString()}
                      </span>
                      <span style={{ color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}>
                        ${goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div 
                      style={{ 
                        width: '100%', 
                        height: '6px', 
                        backgroundColor: '#E2E8F0',
                        borderRadius: '999px',
                        overflow: 'hidden'
                      }}
                    >
                      <div 
                        style={{ 
                          height: '100%',
                          width: `${Math.min(progress, 100)}%`,
                          background: 'linear-gradient(90deg, #059669, #10B981)',
                          borderRadius: '999px',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>

                  {daysRemaining !== null && daysRemaining < 30 && (
                    <div 
                      style={{
                        display: 'inline-block',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.6875rem',
                        fontWeight: '600',
                        backgroundColor: daysRemaining < 7 ? '#FEE2E2' : '#FED7AA',
                        color: daysRemaining < 7 ? '#7F1D1D' : '#7C2D12'
                      }}
                    >
                      {daysRemaining} days remaining
                    </div>
                  )}
                </div>
              )
            })}
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
            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>💡</span>
              <div>
                <h3 style={{ 
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#0F172A',
                  marginBottom: '0.375rem'
                }}>
                  AI Suggestions
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                  You're on track! Keep it up and you'll reach your goals in no time.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Goal Modal */}
      {showCreate && (
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
          onClick={() => setShowCreate(false)}
        >
          <div 
            style={{ 
              position: 'relative',
              width: '100%',
              maxWidth: '440px', 
              borderRadius: '24px', 
              background: 'white',
              padding: '3rem',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCreate(false)}
              type="button"
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

            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #059669, #047857)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}>
                🎯
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ 
                fontFamily: 'Space Grotesk, sans-serif', 
                fontSize: '1.875rem', 
                fontWeight: '700',
                color: '#0F172A',
                marginBottom: '0.5rem'
              }}>
                Create New Goal
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                Set a target and track your progress
              </p>
            </div>

            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label 
                  htmlFor="title"
                  className="input-label"
                >
                  Goal Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g., Emergency Fund"
                  className="input"
                />
              </div>

              <div>
                <label 
                  htmlFor="description"
                  className="input-label"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="What is this goal for?"
                  className="input"
                  style={{ resize: 'none' }}
                />
              </div>

              <div>
                <label 
                  htmlFor="targetAmount"
                  className="input-label"
                >
                  Target Amount
                </label>
                <input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="1000"
                  className="input"
                />
              </div>

              <div>
                <label 
                  htmlFor="deadline"
                  className="input-label"
                >
                  Deadline (Optional)
                </label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  className="input"
                />
              </div>

              <button 
                type="submit"
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                  marginTop: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
                }}
              >
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
