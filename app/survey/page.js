"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

const surveySteps = [
  {
    id: 1,
    title: "Let's start with your income",
    questions: [
      {
        id: "monthlyIncome",
        label: "What's your total monthly income (after taxes)?",
        type: "number",
        placeholder: "5000",
      },
      {
        id: "incomeFrequency",
        label: "How often do you get paid?",
        type: "select",
        options: ["Weekly", "Bi-weekly", "Monthly", "Irregular"],
      },
    ],
  },
  {
    id: 2,
    title: "Housing expenses",
    questions: [
      {
        id: "monthlyRent",
        label: "Monthly rent or mortgage payment",
        type: "number",
        placeholder: "1500",
      },
      {
        id: "propertyTax",
        label: "Monthly property tax (if applicable)",
        type: "number",
        placeholder: "200",
      },
      {
        id: "homeInsurance",
        label: "Monthly home/renters insurance",
        type: "number",
        placeholder: "100",
      },
    ],
  },
  {
    id: 3,
    title: "Utilities and bills",
    questions: [
      {
        id: "electricity",
        label: "Electricity bill",
        type: "number",
        placeholder: "100",
      },
      {
        id: "water",
        label: "Water and sewage",
        type: "number",
        placeholder: "50",
      },
      {
        id: "gas",
        label: "Gas/heating",
        type: "number",
        placeholder: "80",
      },
      {
        id: "internet",
        label: "Internet and phone",
        type: "number",
        placeholder: "120",
      },
    ],
  },
  {
    id: 4,
    title: "Food and groceries",
    questions: [
      {
        id: "groceries",
        label: "Monthly grocery spending",
        type: "number",
        placeholder: "400",
      },
      {
        id: "diningOut",
        label: "Dining out and takeout",
        type: "number",
        placeholder: "200",
      },
    ],
  },
  {
    id: 5,
    title: "Transportation costs",
    questions: [
      {
        id: "carPayment",
        label: "Car payment",
        type: "number",
        placeholder: "350",
      },
      {
        id: "carInsurance",
        label: "Car insurance",
        type: "number",
        placeholder: "150",
      },
      {
        id: "gasFuel",
        label: "Gas/fuel",
        type: "number",
        placeholder: "200",
      },
      {
        id: "publicTransport",
        label: "Public transportation",
        type: "number",
        placeholder: "100",
      },
    ],
  },
  {
    id: 6,
    title: "Healthcare expenses",
    questions: [
      {
        id: "healthInsurance",
        label: "Health insurance premium",
        type: "number",
        placeholder: "300",
      },
      {
        id: "medications",
        label: "Medications and prescriptions",
        type: "number",
        placeholder: "50",
      },
      {
        id: "medicalExpenses",
        label: "Other medical expenses",
        type: "number",
        placeholder: "100",
      },
    ],
  },
  {
    id: 7,
    title: "Debt payments",
    questions: [
      {
        id: "creditCards",
        label: "Credit card payments",
        type: "number",
        placeholder: "200",
      },
      {
        id: "studentLoans",
        label: "Student loan payments",
        type: "number",
        placeholder: "300",
      },
      {
        id: "personalLoans",
        label: "Personal loans",
        type: "number",
        placeholder: "150",
      },
    ],
  },
  {
    id: 8,
    title: "Entertainment and subscriptions",
    questions: [
      {
        id: "streaming",
        label: "Streaming services (Netflix, Spotify, etc.)",
        type: "number",
        placeholder: "50",
      },
      {
        id: "gym",
        label: "Gym or fitness memberships",
        type: "number",
        placeholder: "50",
      },
      {
        id: "hobbies",
        label: "Hobbies and entertainment",
        type: "number",
        placeholder: "100",
      },
    ],
  },
  {
    id: 9,
    title: "Personal care and clothing",
    questions: [
      {
        id: "clothing",
        label: "Clothing and accessories",
        type: "number",
        placeholder: "100",
      },
      {
        id: "personalCare",
        label: "Personal care (haircuts, toiletries, etc.)",
        type: "number",
        placeholder: "75",
      },
    ],
  },
  {
    id: 10,
    title: "Other monthly expenses",
    questions: [
      {
        id: "childcare",
        label: "Childcare or education",
        type: "number",
        placeholder: "500",
      },
      {
        id: "petCare",
        label: "Pet care",
        type: "number",
        placeholder: "100",
      },
      {
        id: "otherExpenses",
        label: "Other regular expenses",
        type: "number",
        placeholder: "100",
      },
    ],
  },
]

export default function SurveyPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [existingInfo, setExistingInfo] = useState(null)
  const [user] = useAuthState(auth)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      user.getIdToken().then(token => {
        fetch("/api/user/financial-info", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            setExistingInfo(data)
            if (data) {
              setAnswers({
                monthlyIncome: data.monthlyIncome || '',
                incomeFrequency: data.incomeFrequency || '',
                monthlyRent: data.monthlyRent || '',
                propertyTax: data.propertyTax || '',
                homeInsurance: data.homeInsurance || '',
                electricity: data.electricity || '',
                water: data.water || '',
                gas: data.gas || '',
                internet: data.internet || '',
                groceries: data.groceries || '',
                diningOut: data.diningOut || '',
                carPayment: data.carPayment || '',
                carInsurance: data.carInsurance || '',
                gasFuel: data.gasFuel || '',
                publicTransport: data.publicTransport || '',
                healthInsurance: data.healthInsurance || '',
                medications: data.medications || '',
                medicalExpenses: data.medicalExpenses || '',
                creditCards: data.creditCards || '',
                studentLoans: data.studentLoans || '',
                personalLoans: data.personalLoans || '',
                streaming: data.streaming || '',
                gym: data.gym || '',
                hobbies: data.hobbies || '',
                clothing: data.clothing || '',
                personalCare: data.personalCare || '',
                childcare: data.childcare || '',
                petCare: data.petCare || '',
                otherExpenses: data.otherExpenses || '',
              })
            }
            setLoading(false)
          })
          .catch(() => setLoading(false))
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (currentStep < surveySteps.length - 1) {
      setCurrentStep(currentStep + 1)
      return
    }

    setLoading(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/user/financial-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          monthlyIncome: parseFloat(answers.monthlyIncome) || 0,
          incomeFrequency: answers.incomeFrequency || '',
          monthlyRent: parseFloat(answers.monthlyRent) || 0,
          propertyTax: parseFloat(answers.propertyTax) || 0,
          homeInsurance: parseFloat(answers.homeInsurance) || 0,
          electricity: parseFloat(answers.electricity) || 0,
          water: parseFloat(answers.water) || 0,
          gas: parseFloat(answers.gas) || 0,
          internet: parseFloat(answers.internet) || 0,
          groceries: parseFloat(answers.groceries) || 0,
          diningOut: parseFloat(answers.diningOut) || 0,
          carPayment: parseFloat(answers.carPayment) || 0,
          carInsurance: parseFloat(answers.carInsurance) || 0,
          gasFuel: parseFloat(answers.gasFuel) || 0,
          publicTransport: parseFloat(answers.publicTransport) || 0,
          healthInsurance: parseFloat(answers.healthInsurance) || 0,
          medications: parseFloat(answers.medications) || 0,
          medicalExpenses: parseFloat(answers.medicalExpenses) || 0,
          creditCards: parseFloat(answers.creditCards) || 0,
          studentLoans: parseFloat(answers.studentLoans) || 0,
          personalLoans: parseFloat(answers.personalLoans) || 0,
          streaming: parseFloat(answers.streaming) || 0,
          gym: parseFloat(answers.gym) || 0,
          hobbies: parseFloat(answers.hobbies) || 0,
          clothing: parseFloat(answers.clothing) || 0,
          personalCare: parseFloat(answers.personalCare) || 0,
          childcare: parseFloat(answers.childcare) || 0,
          petCare: parseFloat(answers.petCare) || 0,
          otherExpenses: parseFloat(answers.otherExpenses) || 0,
          surveyCompleted: true,
        }),
      })

      if (res.ok) {
        router.push("/dashboard")
      } else {
        console.error("Failed to save survey:", await res.text())
        alert("Failed to save. Please try again.")
        setLoading(false)
      }
    } catch (error) {
      console.error("Failed to save survey:", error)
      alert("Failed to save. Please try again.")
      setLoading(false)
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
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1rem' }}>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {surveySteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                index <= currentStep
                  ? 'bg-emerald-600 scale-110'
                  : 'bg-gray-300'
              }`}
            />
            {index < surveySteps.length - 1 && (
              <div
                className={`h-0.5 w-12 mx-1.5 transition-all ${
                  index < currentStep ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      
      <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: '#64748B', marginBottom: '1.5rem' }}>
        Step {currentStep + 1} of {surveySteps.length}
      </p>

      {/* Survey Content */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem 1.75rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #F1F5F9',
        marginBottom: '1.5rem'
      }}>
        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#0F172A',
          marginBottom: '1.75rem',
          textAlign: 'center'
        }}>
          {surveySteps[currentStep].title}
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {surveySteps[currentStep].questions.map((question) => (
            <Input
              key={question.id}
              label={question.label}
              id={question.id}
              type={question.type}
              value={answers[question.id] || ""}
              onChange={(e) =>
                setAnswers({ ...answers, [question.id]: e.target.value })
              }
              placeholder={question.placeholder}
              options={question.options}
            />
          ))}

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1.25rem' }}>
            {currentStep > 0 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                ← Back
              </Button>
            )}
            <Button type="submit" className="flex-1">
              {currentStep < surveySteps.length - 1 
                ? "Next →" 
                : existingInfo?.surveyCompleted 
                  ? "Update →" 
                  : "Complete →"
              }
            </Button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div style={{
        background: 'linear-gradient(135deg, #F0FDF4 0%, #D1FAE5 100%)',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #A7F3D0'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
          <span style={{ fontSize: '2rem' }}>💡</span>
          <div>
            <h3 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '1rem',
              fontWeight: '700',
              color: '#065F46',
              marginBottom: '0.5rem'
            }}>
              Why we ask this information
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#047857', lineHeight: '1.5' }}>
              We use your financial information to calculate expense ratios, suggest savings
              goals, and provide personalized recommendations to help you achieve financial
              freedom.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
