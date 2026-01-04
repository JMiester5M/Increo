import { verifyFirebaseToken } from "@/lib/auth-helpers"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const decodedToken = await verifyFirebaseToken(request)
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      include: { financialInfo: true },
    })

    if (!user) {
      return NextResponse.json({ surveyCompleted: false })
    }

    return NextResponse.json(user.financialInfo || { surveyCompleted: false })
  } catch (error) {
    console.error("Error fetching financial info:", error)
    return NextResponse.json(
      { error: "Failed to fetch financial info" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const decodedToken = await verifyFirebaseToken(request)
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { monthlyIncome, surveyCompleted } = body

    const financialInfo = await prisma.financialInfo.upsert({
      where: { userId: decodedToken.uid },
      update: {
        monthlyIncome,
        surveyCompleted,
      },
      create: {
        userId: decodedToken.uid,
        monthlyIncome,
        surveyCompleted,
      },
    })

    return NextResponse.json(financialInfo)
  } catch (error) {
    console.error("Error updating financial info:", error)
    return NextResponse.json(
      { error: "Failed to update financial info" },
      { status: 500 }
    )
  }
}
