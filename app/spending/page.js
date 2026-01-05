"use client"

import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

const DEFAULT_CATEGORIES = ["Food", "Transportation", "Housing", "Entertainment", "Shopping", "Healthcare", "Other"]

export default function SpendingPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORIES[0])
  const [expandedCategories, setExpandedCategories] = useState({})
  const [user] = useAuthState(auth)

  useEffect(() => {
    if (user) {
      fetchExpenses()
      fetchCategories()
    }
  }, [user])

  const fetchCategories = async () => {
    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories)
          setSelectedCategory(data.categories[0])
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchExpenses = async () => {
    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setExpenses(data)
    } catch (error) {
      console.error("Failed to fetch expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateExpense = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)

    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: formData.get("category"),
          amount: parseFloat(formData.get("amount")),
          description: formData.get("description"),
          date: formData.get("date") || new Date().toISOString(),
        }),
      })

      if (res.ok) {
        setShowCreate(false)
        fetchExpenses()
        e.target.reset()
      }
    } catch (error) {
      console.error("Failed to create expense:", error)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newCategory = formData.get("categoryName")

    if (!newCategory || categories.includes(newCategory)) {
      return
    }

    try {
      const token = await user.getIdToken()
      const updatedCategories = [...categories, newCategory]
      
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categories: updatedCategories,
        }),
      })

      if (res.ok) {
        setCategories(updatedCategories)
        setShowAddCategory(false)
        e.target.reset()
      }
    } catch (error) {
      console.error("Failed to add category:", error)
    }
  }

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = []
    }
    acc[expense.category].push(expense)
    return acc
  }, {})

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

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
            Spending
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Monitor your expenses and stay on budget
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddCategory(true)}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              background: 'white',
              color: '#059669',
              fontWeight: '600',
              fontSize: '0.875rem',
              border: '2px solid #059669',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#F0FDF4'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            + Add Category
          </button>
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
            Add Expense
          </button>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div 
        className="card-hover"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(239, 68, 68, 0.1)',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
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
                Total Expenses
              </div>
            </div>
            <p style={{ 
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '2rem',
              fontWeight: '700',
              color: '#DC2626',
              lineHeight: '1'
            }}>
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.625rem' }}>
              Across all categories
            </p>
          </div>
        </div>
      </div>

      {/* Expenses by Category */}
      <div className="space-y-4">
        {Object.entries(expensesByCategory).map(([category, categoryExpenses]) => {
          const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
          const categoryIcons = {
            Food: '🍔',
            Transportation: '🚗',
            Housing: '🏠',
            Entertainment: '📺',
            Shopping: '🛍️',
            Healthcare: '⚕️',
            Other: '📌'
          }
          const categoryIcon = categoryIcons[category] || '📊'
          const isExpanded = expandedCategories[category] || false
          
          return (
            <div 
              key={category} 
              className="bg-white rounded-2xl p-5 overflow-hidden card-hover"
              style={{ 
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                border: '1px solid #F1F5F9',
                transition: 'all 0.3s ease'
              }}
            >
              <button
                onClick={() => setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div style={{
                    fontSize: '1.5rem',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #F0FDF4 0%, #D1FAE5 100%)',
                    borderRadius: '12px'
                  }}>
                    {categoryIcon}
                  </div>
                  <div>
                    <h3 style={{ 
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: '#0F172A',
                      marginBottom: '0.125rem'
                    }}>
                      {category}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {categoryExpenses.length} transaction{categoryExpenses.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span style={{ 
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#DC2626'
                  }}>
                    ${categoryTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <svg 
                    className={`h-5 w-5 transition-transform ${ isExpanded ? 'rotate-180' : ''}`}
                    style={{ color: '#64748B' }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                  {categoryExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-gray-50"
                    >
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#0F172A' }}>
                          {expense.description || expense.subcategory || category}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span style={{ 
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#0F172A'
                      }}>
                        ${expense.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {Object.keys(expensesByCategory).length === 0 && (
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
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>💳</span>
            <h2 style={{ 
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: '0.625rem'
            }}>
              No Expenses Yet
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#64748B', marginBottom: '1.5rem', maxWidth: '28rem', margin: '0 auto 1.5rem' }}>
              Start tracking your expenses today to get valuable insights into your spending habits
            </p>
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
                cursor: 'pointer'
              }}
            >
              Add Your First Expense
            </button>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
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
                background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}>
                💳
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
                Add Expense
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                Track your spending to stay on budget
              </p>
            </div>

            <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label 
                  htmlFor="category"
                  className="input-label"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label 
                  htmlFor="amount"
                  className="input-label"
                >
                  Amount
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="25.00"
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
                <input
                  id="description"
                  name="description"
                  type="text"
                  placeholder="What was this for?"
                  className="input"
                />
              </div>

              <div>
                <label 
                  htmlFor="date"
                  className="input-label"
                >
                  Date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
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
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
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
          onClick={() => setShowAddCategory(false)}
        >
          <div 
            style={{ 
              position: 'relative',
              width: '100%',
              maxWidth: '440px', 
              borderRadius: '24px', 
              background: 'white',
              padding: '3rem',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddCategory(false)}
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
                📁
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
                Add Category
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                Create a custom expense category
              </p>
            </div>

            <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label 
                  htmlFor="categoryName"
                  className="input-label"
                >
                  Category Name
                </label>
                <input
                  id="categoryName"
                  name="categoryName"
                  type="text"
                  required
                  placeholder="e.g., Pet Care"
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
                Add Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
