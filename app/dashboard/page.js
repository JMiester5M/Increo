"use client"

import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function DashboardPage() {
  const [user] = useAuthState(auth)
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    monthlyExpenses: 0,
    monthlyIncome: 0,
  })
  const [goals, setGoals] = useState([])
  const [aiAlerts, setAiAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    user.getIdToken().then(token => {
      Promise.all([
        fetch("/api/goals", {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json()),
        fetch("/api/expenses", {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json()),
        fetch("/api/user/financial-info", {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json()),
      ])
        .then(([goals, expenses, financialInfo]) => {
          const now = new Date()
          const currentMonth = now.getMonth()
          const currentYear = now.getFullYear()

          const monthlyExpenses = expenses
            .filter(exp => {
              const expDate = new Date(exp.date)
              return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear
            })
            .reduce((sum, exp) => sum + exp.amount, 0)

          // Category totals for the current month
          const categoryTotals = expenses.reduce((acc, exp) => {
            const expDate = new Date(exp.date)
            if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
              acc[exp.category] = (acc[exp.category] || 0) + exp.amount
            }
            return acc
          }, {})

          const monthlyIncome = financialInfo?.monthlyIncome || 0
          const highSpendCategories = Object.entries(categoryTotals)
            .filter(([, total]) => monthlyIncome > 0 && total >= Math.max(monthlyIncome * 0.3, 200))
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)

          const generatedAlerts = highSpendCategories.map(([category, total]) => ({
            category,
            total,
            threshold: Math.max(monthlyIncome * 0.3, 200)
          }))

          setGoals(goals.filter(g => !g.completed))
          setStats({
            totalGoals: goals.length,
            completedGoals: goals.filter(g => g.completed).length,
            monthlyExpenses,
            monthlyIncome,
          })
          setAiAlerts(generatedAlerts)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    })
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  const remaining = stats.monthlyIncome - stats.monthlyExpenses

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontFamily: 'Space Grotesk, sans-serif', 
          fontSize: '1.875rem', 
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: '0.375rem'
        }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
          Welcome back! Here's your financial overview.
        </p>
      </div>

      {/* Top Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Estimated Balance Card */}
        <div 
          className="card-hover"
          style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(5, 150, 105, 0.1)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
        >
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              fontSize: '1.25rem'
            }}>💰</div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#64748B',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Balance
            </div>
          </div>
          <div style={{ 
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '1.875rem',
            fontWeight: '700',
            color: remaining >= 0 ? '#059669' : '#DC2626',
            lineHeight: '1'
          }}>
            ${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>
            {remaining >= 0 ? 'Available funds' : 'Over budget'}
          </p>
        </div>

        {/* Monthly Income Card */}
        <div 
          className="card-hover"
          style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(16, 185, 129, 0.1)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
        >
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              fontSize: '1.25rem'
            }}>💵</div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#64748B',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Income
            </div>
          </div>
          <div style={{ 
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#10B981',
            lineHeight: '1'
          }}>
            ${stats.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>
            This month
          </p>
        </div>

        {/* Monthly Expenses Card */}
        <div 
          className="card-hover"
          style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
        >
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              fontSize: '1.25rem'
            }}>💳</div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#64748B',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Expenses
            </div>
          </div>
          <div style={{ 
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#EF4444',
            lineHeight: '1'
          }}>
            ${stats.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>
            This month
          </p>
        </div>
      </div>

      {/* Active Goals Section */}
      <div 
        style={{ 
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid #F1F5F9',
          marginBottom: '2rem'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ fontSize: '1.375rem' }}>🎯</div>
            <h2 style={{ 
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#0F172A'
            }}>
              Active Goals
            </h2>
          </div>
          <Link 
            href="/goals" 
            style={{ 
              fontSize: '0.875rem',
              color: '#059669',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              transition: 'gap 0.2s ease'
            }}
            className="link-hover"
          >
            View All
            <span style={{ fontSize: '1rem' }}>→</span>
          </Link>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {goals.length === 0 ? (
            <div style={{ 
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
              <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem' }}>
                No active goals yet
              </p>
              <Link href="/goals">
                <button style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  Create Your First Goal
                </button>
              </Link>
            </div>
          ) : (
            goals.slice(0, 3).map(goal => {
              const progress = goal.currentAmount ? (goal.currentAmount / goal.targetAmount) * 100 : 0
              return (
                <div 
                  key={goal.id}
                  className="card-hover"
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    border: '1px solid #E2E8F0',
                    borderLeft: '3px solid #059669',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ 
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#0F172A',
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {goal.title}
                  </div>
                  {goal.description && (
                    <p style={{ 
                      fontSize: '0.8125rem',
                      color: '#64748B',
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {goal.description}
                    </p>
                  )}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ 
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#059669',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}>
                        ${goal.currentAmount?.toLocaleString() || '0'}
                      </span>
                      <span style={{ 
                        fontSize: '0.75rem',
                        color: '#64748B',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}>
                        ${goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: '#E2E8F0',
                      borderRadius: '999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(progress, 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #059669, #10B981)',
                        borderRadius: '999px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                  {goal.deadline && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontSize: '0.75rem',
                      color: '#64748B'
                    }}>
                      <span>📅</span>
                      <span>
                        {new Date(goal.deadline).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Alerts Section */}
      <div 
        style={{ 
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid #F1F5F9'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '1.375rem' }}>🔔</div>
          <h2 style={{ 
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#0F172A'
          }}>
            Alerts
          </h2>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {aiAlerts.map(alert => (
            <div 
              key={alert.category}
              style={{ 
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                background: '#FEF2F2',
                borderLeft: '4px solid #F87171',
                borderRadius: '12px'
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>🤖</div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: '600',
                  color: '#0F172A',
                  marginBottom: '0.25rem'
                }}>
                  AI Notice: High spending in {alert.category}
                </div>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: '#475569'
                }}>
                  ${alert.total.toLocaleString()} spent this month. This is above your comfortable limit of ${alert.threshold.toLocaleString()}. Consider trimming this category or setting a tighter budget.
                </div>
              </div>
            </div>
          ))}
          {stats.monthlyExpenses > stats.monthlyIncome && (
            <div 
              style={{ 
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                background: '#FEF3C7',
                borderLeft: '4px solid #F59E0B',
                borderRadius: '12px'
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>⚠️</div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: '600',
                  color: '#0F172A',
                  marginBottom: '0.25rem'
                }}>
                  High spending alert
                </div>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: '#475569'
                }}>
                  You've exceeded your monthly income this month
                </div>
              </div>
            </div>
          )}
          {stats.monthlyExpenses === 0 && (
            <div 
              style={{ 
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                background: '#FEF3C7',
                borderLeft: '4px solid #F59E0B',
                borderRadius: '12px'
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>ℹ️</div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: '600',
                  color: '#0F172A',
                  marginBottom: '0.25rem'
                }}>
                  Start tracking
                </div>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: '#475569'
                }}>
                  Add your first expense to see insights
                </div>
              </div>
            </div>
          )}
          {stats.totalGoals === 0 && (
            <div 
              style={{ 
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                background: '#FEF3C7',
                borderLeft: '4px solid #F59E0B',
                borderRadius: '12px'
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>💡</div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: '600',
                  color: '#0F172A',
                  marginBottom: '0.25rem'
                }}>
                  Set your first goal
                </div>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: '#475569'
                }}>
                  Create a savings goal to stay motivated
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
