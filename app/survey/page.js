"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"

const surveyQuestions = [
  {
    id: "monthlyIncome",
    question: "What is your monthly income?",
    type: "number",
    placeholder: "5000",
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
            if (data?.monthlyIncome) {
              setAnswers({ monthlyIncome: data.monthlyIncome })
            }
            setLoading(false)
          })
          .catch(() => setLoading(false))
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/user/financial-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          monthlyIncome: parseFloat(answers.monthlyIncome),
          surveyCompleted: true,
        }),
      })

      if (res.ok) {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Failed to save survey:", error)
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
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Survey</h1>
        <p className="mt-2 text-gray-600">
          Help us understand your finances to provide better insights
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {surveyQuestions.map((question, index) => (
            <div key={question.id}>
              <label className="block text-lg font-medium text-gray-900 mb-3">
                {question.question}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type={question.type}
                  value={answers[question.id] || ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [question.id]: e.target.value })
                  }
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-3 text-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={question.placeholder}
                />
              </div>
            </div>
          ))}

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 mb-4">
              This information helps us provide personalized recommendations and insights
              for your financial goals.
            </p>
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-lg font-semibold text-white hover:bg-emerald-600 transition-colors"
            >
              {existingInfo?.surveyCompleted ? "Update Information" : "Complete Survey"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Why we ask</h3>
        <p className="text-sm text-blue-800">
          We use your financial information to calculate expense ratios, suggest savings
          goals, and provide AI-powered recommendations to help you achieve financial
          freedom.
        </p>
      </div>
    </div>
  )
}
