"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"

const getPayPeriodsPerMonth = (frequency) => {
  if (!frequency) return 1
  const freq = frequency.toLowerCase()
  if (freq.includes('week') && freq.includes('bi')) return 2.17 // bi-weekly ~26/year
  if (freq.includes('week')) return 4.33 // weekly ~52/year
  if (freq.includes('irregular')) return 1
  return 1 // monthly or default
}

export default function GoalDetailPage() {
  const [goal, setGoal] = useState(null)
  const [financialInfo, setFinancialInfo] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [user] = useAuthState(auth)
  const router = useRouter()
  const params = useParams()
  const goalId = params?.id?.toString()
  const [addAmount, setAddAmount] = useState("")
  const [aiAdvice, setAiAdvice] = useState("")
  const [generatingAdvice, setGeneratingAdvice] = useState(false)

  // Recompute AI advice whenever goal or financial context changes
  useEffect(() => {
    if (loading) return
    if (goal && financialInfo) {
      generateAIAdvice(goal, financialInfo, expenses)
    }
  }, [goal?.currentAmount, goal?.targetAmount, goal?.deadline, financialInfo, expenses, loading])

  useEffect(() => {
    if (!user || !goalId) return
    fetchData()
  }, [user, goalId])

  const fetchData = async () => {
    if (!goalId) return
    try {
      const token = await user.getIdToken()
      
      const [goalsRes, financialRes, expensesRes] = await Promise.all([
        fetch("/api/goals", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/user/financial-info", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/expenses", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const goals = await goalsRes.json()
      const financial = await financialRes.json()
      const expensesData = await expensesRes.json()

      const currentGoal = goals.find(g => g.id === goalId)
      if (!currentGoal) {
        router.push("/goals")
        return
      }

      setGoal(currentGoal)
      setFinancialInfo(financial)
      setExpenses(expensesData)
      
      // Generate AI advice
      generateAIAdvice(currentGoal, financial, expensesData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateAIAdvice = (goalData, financial, expensesData) => {
    setGeneratingAdvice(true)
    
    // Calculate monthly expenses
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const monthlyExpenses = expensesData
      .filter(exp => {
        const expDate = new Date(exp.date)
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear
      })
      .reduce((sum, exp) => sum + exp.amount, 0)

    const monthlyIncome = financial?.monthlyIncome || 0
    const remaining = monthlyIncome - monthlyExpenses
    const amountNeeded = goalData.targetAmount - (goalData.currentAmount || 0)
    const payPeriods = getPayPeriodsPerMonth(financial?.incomeFrequency)
    const perPayLeftover = payPeriods > 0 ? remaining / payPeriods : remaining
    const safePerPay = perPayLeftover > 0 ? perPayLeftover * 0.8 : 0
    const safeSaveBudget = remaining > 0 ? Math.min(remaining * 0.8, safePerPay * payPeriods) : 0 // keep ~20% buffer and align to pay cycle
    
    // Calculate time until deadline
    let monthsUntilDeadline = null
    if (goalData.deadline) {
      const deadline = new Date(goalData.deadline)
      const monthsDiff = (deadline.getFullYear() - now.getFullYear()) * 12 + deadline.getMonth() - now.getMonth()
      monthsUntilDeadline = Math.max(1, monthsDiff)
    }

    // Generate personalized advice
    let advice = []

    // Early exits when data is insufficient or goal already met
    if (amountNeeded <= 0) {
      advice.push("🎉 Goal is fully funded. Consider marking it complete or setting a new target.")
      setAiAdvice(advice.join('\n\n'))
      setGeneratingAdvice(false)
      return
    }

    if (monthlyIncome === 0 && expensesData.length === 0) {
      advice.push("⚠️ Add your income and expenses to get tailored guidance. Complete the survey first.")
      setAiAdvice(advice.join('\n\n'))
      setGeneratingAdvice(false)
      return
    }

    // Income and expense analysis
    if (monthlyIncome === 0) {
      advice.push("⚠️ **Add your income information** to get personalized savings recommendations.")
    } else {
      const savingsRate = remaining > 0 ? (remaining / monthlyIncome) * 100 : 0
      
      if (remaining <= 0) {
        advice.push(`⚠️ **Your monthly expenses ($${monthlyExpenses.toLocaleString()}) exceed your income ($${monthlyIncome.toLocaleString()})**. Pause contributions and focus on reducing expenses.`)
        setAiAdvice(advice.join('\n\n'))
        setGeneratingAdvice(false)
        return
      } else {
        advice.push(`💰 You currently have **$${remaining.toLocaleString()}** left after monthly expenses, which is ${savingsRate.toFixed(1)}% of your income.`)
      }
    }

    // Goal-specific recommendations
    if (monthsUntilDeadline && remaining > 0) {
      const requiredMonthlySaving = amountNeeded / monthsUntilDeadline
      const perPayBudget = safePerPay > 0 ? safePerPay : 0
      const maxMonthlyWithinPaycheck = perPayBudget * payPeriods
      const recommendedMonthly = Math.min(requiredMonthlySaving, safeSaveBudget, maxMonthlyWithinPaycheck)
      const recommendedPerPay = payPeriods > 0 ? recommendedMonthly / payPeriods : recommendedMonthly
      
      if (requiredMonthlySaving <= remaining) {
        advice.push(`✅ **You can reach this goal!** Save $${recommendedMonthly.toFixed(2)} per month (~$${recommendedPerPay.toFixed(2)} each paycheck) for the next ${monthsUntilDeadline} months.`)
      } else {
        const shortfall = requiredMonthlySaving - remaining
        advice.push(`⚠️ You need $${requiredMonthlySaving.toFixed(2)}/month to reach this goal by the deadline, but only have $${remaining.toFixed(2)} available. Consider extending the deadline or finding ways to save an additional $${shortfall.toFixed(2)}/month.`)
      }
    } else if (remaining > 0) {
      const baseAuto = Math.max(remaining * 0.25, Math.min(remaining, 50))
      const perPayBudget = safePerPay > 0 ? safePerPay : 0
      const cappedAuto = Math.min(baseAuto, safeSaveBudget, perPayBudget * payPeriods)
      const autoPerPay = payPeriods > 0 ? cappedAuto / payPeriods : cappedAuto
      advice.push(`🚀 No deadline set. Focus on consistent habits:`)
      advice.push(`• Auto-transfer $${autoPerPay.toFixed(2)} each paycheck (about $${cappedAuto.toFixed(2)} per month) into this goal.`)
      advice.push(`• Use round-ups or a weekly sweep of leftover checking balance into this goal.`)
      advice.push(`• Trim 1-2 categories by 10-15% and move the difference here.`)
    }

    // If we have no actionable suggestions (e.g., missing data), provide a nudge
    if (advice.length === 0) {
      advice.push("Add income and expenses to get personalized savings recommendations.")
    }

    // Category-specific advice based on expenses
    const categoryTotals = expensesData.reduce((acc, exp) => {
      const expDate = new Date(exp.date)
      if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      }
      return acc
    }, {})

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    if (sortedCategories.length > 0 && remaining > 0 && amountNeeded > remaining) {
      advice.push(`\n**💡 Savings Opportunities:**`)
      sortedCategories.forEach(([category, amount]) => {
        const potentialSaving = amount * 0.15
        advice.push(`• **${category}**: $${amount.toFixed(2)}/month - Consider reducing by 15% to save an extra $${potentialSaving.toFixed(2)}`)
      })
    }

    // Financial health tips
    if (financial?.surveyCompleted) {
      const fixedExpenses = [
        financial.monthlyRent,
        financial.propertyTax,
        financial.homeInsurance,
        financial.electricity,
        financial.water,
        financial.gas,
        financial.internet,
        financial.carPayment,
        financial.carInsurance,
        financial.healthInsurance
      ].reduce((sum, val) => sum + (val || 0), 0)

      const variableExpenses = monthlyExpenses - fixedExpenses

      if (variableExpenses > fixedExpenses * 0.5 && remaining > 0) {
        advice.push(`\n**🎯 Focus Area**: Your variable expenses are high. Small changes in daily spending (dining out, entertainment, shopping) can significantly boost your savings.`)
      }
    }

    setAiAdvice(advice.join('\n\n'))
    setGeneratingAdvice(false)
  }

  const handleAdjustMoney = async (direction) => {
    const amount = parseFloat(addAmount)
    if (isNaN(amount) || amount <= 0) return
    const signedAmount = direction === 'add' ? amount : -amount
    const nextAmount = Math.max(0, (goal.currentAmount || 0) + signedAmount)

    try {
      const token = await user.getIdToken()
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentAmount: nextAmount
        })
      })

      if (res.ok) {
        const updatedGoal = await res.json()
        setGoal(updatedGoal)
        setAddAmount("")
        if (financialInfo) {
          generateAIAdvice(updatedGoal, financialInfo, expenses)
        }
      }
    } catch (error) {
      console.error("Failed to update goal:", error)
    }
  }

  const handleDeleteGoal = async () => {
    if (!confirm("Are you sure you want to delete this goal?")) return

    try {
      const token = await user.getIdToken()
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        router.push("/goals")
      }
    } catch (error) {
      console.error("Failed to delete goal:", error)
    }
  }

  const handleMarkComplete = async () => {
    try {
      const token = await user.getIdToken()
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          completed: !goal.completed
        })
      })

      if (res.ok) {
        const updatedGoal = await res.json()
        setGoal(updatedGoal)
        if (financialInfo) {
          generateAIAdvice(updatedGoal, financialInfo, expenses)
        }
      }
    } catch (error) {
      console.error("Failed to update goal:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!goal) return null

  const progress = ((goal.currentAmount || 0) / goal.targetAmount) * 100
  const remaining = goal.targetAmount - (goal.currentAmount || 0)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Back Button */}
      <button
        onClick={() => router.push("/goals")}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#059669',
          fontWeight: '600',
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0'
        }}
      >
        <span>←</span> Back to Goals
      </button>

      {/* Goal Header */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #F1F5F9',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '2rem',
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: '0.5rem'
            }}>
              {goal.title}
            </h1>
            {goal.description && (
              <p style={{ fontSize: '0.9375rem', color: '#64748B' }}>
                {goal.description}
              </p>
            )}
          </div>
          {goal.completed && (
            <div style={{
              fontSize: '2rem',
              background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '1rem'
            }}>
              ✓
            </div>
          )}
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'baseline',
            marginBottom: '0.75rem'
          }}>
            <div>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '2.25rem',
                fontWeight: '700',
                color: '#059669'
              }}>
                ${(goal.currentAmount || 0).toLocaleString()}
              </span>
              <span style={{
                fontSize: '0.9375rem',
                color: '#64748B',
                marginLeft: '0.5rem'
              }}>
                of ${goal.targetAmount.toLocaleString()}
              </span>
            </div>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: '#059669'
            }}>
              {progress.toFixed(1)}%
            </div>
          </div>

          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#E2E8F0',
            borderRadius: '999px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(progress, 100)}%`,
              background: 'linear-gradient(90deg, #059669, #10B981)',
              borderRadius: '999px',
              transition: 'width 0.3s ease'
            }} />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.75rem',
            fontSize: '0.875rem',
            color: '#64748B'
          }}>
            <span>
              ${remaining.toLocaleString()} remaining
            </span>
            {goal.deadline && (
              <span>
                Target: {new Date(goal.deadline).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            )}
          </div>
        </div>

        {/* Add Money Form */}
        {!goal.completed && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              style={{
                flex: 1,
                minWidth: '180px',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                fontSize: '0.9375rem',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleAdjustMoney('add')}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Add Funds
              </button>
              <button
                type="button"
                onClick={() => handleAdjustMoney('subtract')}
                style={{
                  padding: '0.75rem 1.1rem',
                  borderRadius: '10px',
                  background: '#FFF1F2',
                  color: '#BE123C',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  border: '1px solid #FBCFE8',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Take Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Advice Section */}
      <div style={{
        background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
        borderRadius: '16px',
        padding: '1.75rem',
        border: '1px solid #A7F3D0',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.75rem' }}>🤖</span>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#0F172A'
          }}>
            AI Savings Coach
          </h2>
        </div>

        {generatingAdvice ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#059669' }}>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
            <span>Analyzing your finances...</span>
          </div>
        ) : (
          <div style={{
            fontSize: '0.9375rem',
            color: '#064E3B',
            lineHeight: '1.6',
            whiteSpace: 'pre-line'
          }}>
            {aiAdvice || "Complete your financial survey to get personalized advice."}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #F1F5F9',
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handleMarkComplete}
          style={{
            flex: 1,
            minWidth: '140px',
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            background: goal.completed ? '#F1F5F9' : 'linear-gradient(135deg, #059669, #047857)',
            color: goal.completed ? '#64748B' : 'white',
            fontWeight: '600',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {goal.completed ? 'Mark Incomplete' : 'Mark Complete'}
        </button>
        <button
          onClick={handleDeleteGoal}
          style={{
            flex: 1,
            minWidth: '140px',
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            background: 'white',
            color: '#EF4444',
            fontWeight: '600',
            fontSize: '0.875rem',
            border: '1px solid #FCA5A5',
            cursor: 'pointer'
          }}
        >
          Delete Goal
        </button>
      </div>
    </div>
  )
}
