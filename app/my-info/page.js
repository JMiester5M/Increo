"use client"

import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import Link from "next/link"

export default function MyInfoPage() {
  const [user] = useAuthState(auth)
  const [financialInfo, setFinancialInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      user.getIdToken().then(token => {
        fetch("/api/user/financial-info", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            setFinancialInfo(data)
            setLoading(false)
          })
          .catch(() => setLoading(false))
      })
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  const InfoItem = ({ label, value, isCurrency = true }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 0',
      borderBottom: '1px solid #E2E8F0'
    }}>
      <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: '500' }}>
        {label}
      </span>
      <span style={{ 
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#0F172A'
      }}>
        {isCurrency ? `$${value?.toLocaleString() || '0'}` : value || 'Not set'}
      </span>
    </div>
  )

  if (!financialInfo?.surveyCompleted) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 1rem' }}>
        <h1 style={{ 
          fontFamily: 'Space Grotesk, sans-serif', 
          fontSize: '1.875rem', 
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: '1.5rem'
        }}>
          My Financial Info
        </h1>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid #F1F5F9',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📊</div>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.375rem',
            fontWeight: '700',
            color: '#0F172A',
            marginBottom: '0.75rem'
          }}>
            No Financial Information Yet
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#64748B', marginBottom: '1.75rem' }}>
            Complete the financial survey to see your information here
          </p>
          <Link href="/survey">
            <button style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
            }}>
              Complete Survey
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const totalExpenses = (financialInfo.monthlyRent || 0) + 
                        (financialInfo.propertyTax || 0) +
                        (financialInfo.homeInsurance || 0) +
                        (financialInfo.electricity || 0) +
                        (financialInfo.water || 0) +
                        (financialInfo.gas || 0) +
                        (financialInfo.internet || 0) +
                        (financialInfo.groceries || 0) +
                        (financialInfo.diningOut || 0) +
                        (financialInfo.carPayment || 0) +
                        (financialInfo.carInsurance || 0) +
                        (financialInfo.gasFuel || 0) +
                        (financialInfo.publicTransport || 0) +
                        (financialInfo.healthInsurance || 0) +
                        (financialInfo.medications || 0) +
                        (financialInfo.medicalExpenses || 0) +
                        (financialInfo.creditCards || 0) +
                        (financialInfo.studentLoans || 0) +
                        (financialInfo.personalLoans || 0) +
                        (financialInfo.streaming || 0) +
                        (financialInfo.gym || 0) +
                        (financialInfo.hobbies || 0) +
                        (financialInfo.clothing || 0) +
                        (financialInfo.personalCare || 0) +
                        (financialInfo.childcare || 0) +
                        (financialInfo.petCare || 0) +
                        (financialInfo.otherExpenses || 0)

  const remaining = (financialInfo.monthlyIncome || 0) - totalExpenses

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ 
          fontFamily: 'Space Grotesk, sans-serif', 
          fontSize: '1.875rem', 
          fontWeight: '700',
          color: '#0F172A'
        }}>
          My Financial Info
        </h1>
        <Link href="/survey">
          <button style={{
            padding: '0.5rem 1rem',
            border: '1px solid #E2E8F0',
            background: 'white',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            color: '#059669'
          }}>
            Edit Info
          </button>
        </Link>
      </div>

      {/* Summary Card */}
      <div style={{
        background: 'linear-gradient(135deg, #059669, #047857)',
        borderRadius: '16px',
        padding: '1.75rem',
        marginBottom: '1.5rem',
        color: 'white'
      }}>
        <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
          Monthly Income
        </div>
        <div style={{ 
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '2.25rem',
          fontWeight: '700',
          marginBottom: '1rem'
        }}>
          ${financialInfo.monthlyIncome?.toLocaleString() || '0'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', opacity: 0.8, marginBottom: '0.25rem' }}>Total Expenses</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.125rem', fontWeight: '600' }}>
              ${totalExpenses.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6875rem', opacity: 0.8, marginBottom: '0.25rem' }}>Remaining</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.125rem', fontWeight: '600' }}>
              ${remaining.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Income Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #F1F5F9',
        marginBottom: '1.25rem'
      }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.125rem',
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: '1rem'
        }}>
          Income
        </h2>
        <InfoItem label="Monthly Income" value={financialInfo.monthlyIncome} />
        <InfoItem label="Payment Frequency" value={financialInfo.incomeFrequency} isCurrency={false} />
      </div>

      {/* Housing Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #F1F5F9',
        marginBottom: '1.25rem'
      }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.125rem',
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: '1rem'
        }}>
          Housing Expenses
        </h2>
        <InfoItem label="Rent/Mortgage" value={financialInfo.monthlyRent} />
        <InfoItem label="Property Tax" value={financialInfo.propertyTax} />
        <InfoItem label="Home Insurance" value={financialInfo.homeInsurance} />
      </div>

      {/* Utilities Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #F1F5F9',
        marginBottom: '1.25rem'
      }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.125rem',
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: '1rem'
        }}>
          Utilities
        </h2>
        <InfoItem label="Electricity" value={financialInfo.electricity} />
        <InfoItem label="Water & Sewage" value={financialInfo.water} />
        <InfoItem label="Gas/Heating" value={financialInfo.gas} />
        <InfoItem label="Internet & Phone" value={financialInfo.internet} />
      </div>

      {/* Food Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #F1F5F9',
        marginBottom: '1.25rem'
      }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.125rem',
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: '1rem'
        }}>
          Food & Dining
        </h2>
        <InfoItem label="Groceries" value={financialInfo.groceries} />
        <InfoItem label="Dining Out" value={financialInfo.diningOut} />
      </div>

      {/* Transportation Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #F1F5F9',
        marginBottom: '1.25rem'
      }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.125rem',
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: '1rem'
        }}>
          Transportation
        </h2>
        <InfoItem label="Car Payment" value={financialInfo.carPayment} />
        <InfoItem label="Car Insurance" value={financialInfo.carInsurance} />
        <InfoItem label="Gas/Fuel" value={financialInfo.gasFuel} />
        <InfoItem label="Public Transport" value={financialInfo.publicTransport} />
      </div>

      {/* Healthcare Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #F1F5F9',
        marginBottom: '1.25rem'
      }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.125rem',
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: '1rem'
        }}>
          Healthcare
        </h2>
        <InfoItem label="Health Insurance" value={financialInfo.healthInsurance} />
        <InfoItem label="Medications" value={financialInfo.medications} />
        <InfoItem label="Medical Expenses" value={financialInfo.medicalExpenses} />
      </div>

      {/* Debt Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #F1F5F9',
        marginBottom: '1.25rem'
      }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.125rem',
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: '1rem'
        }}>
          Debt Payments
        </h2>
        <InfoItem label="Credit Cards" value={financialInfo.creditCards} />
        <InfoItem label="Student Loans" value={financialInfo.studentLoans} />
        <InfoItem label="Personal Loans" value={financialInfo.personalLoans} />
      </div>

      {/* Entertainment Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #F1F5F9',
        marginBottom: '1.25rem'
      }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.125rem',
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: '1rem'
        }}>
          Entertainment & Subscriptions
        </h2>
        <InfoItem label="Streaming Services" value={financialInfo.streaming} />
        <InfoItem label="Gym Membership" value={financialInfo.gym} />
        <InfoItem label="Hobbies" value={financialInfo.hobbies} />
      </div>

      {/* Personal Care Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #F1F5F9',
        marginBottom: '1.25rem'
      }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.125rem',
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: '1rem'
        }}>
          Personal Care
        </h2>
        <InfoItem label="Clothing" value={financialInfo.clothing} />
        <InfoItem label="Personal Care" value={financialInfo.personalCare} />
      </div>

      {/* Other Expenses Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #F1F5F9'
      }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.125rem',
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: '1rem'
        }}>
          Other Expenses
        </h2>
        <InfoItem label="Childcare" value={financialInfo.childcare} />
        <InfoItem label="Pet Care" value={financialInfo.petCare} />
        <InfoItem label="Other" value={financialInfo.otherExpenses} />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 0',
          marginTop: '1rem',
          borderTop: '2px solid #E2E8F0'
        }}>
          <span style={{ fontSize: '0.9375rem', color: '#0F172A', fontWeight: '700' }}>
            Total Monthly Expenses
          </span>
          <span style={{ 
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '1.125rem',
            fontWeight: '700',
            color: '#DC2626'
          }}>
            ${totalExpenses.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
