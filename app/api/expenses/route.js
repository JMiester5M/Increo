import { verifyFirebaseToken } from "@/lib/auth-helpers"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const decodedToken = await verifyFirebaseToken(request)
    if (!decodedToken) {
      console.error("Token verification failed in expenses GET")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.log("Expenses GET - User authenticated:", decodedToken.uid)

    const expenses = await prisma.expense.findMany({
      where: { userId: decodedToken.uid },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const decodedToken = await verifyFirebaseToken(request)
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { category, subcategory, amount, description, date } = body

    // Convert date to EST if provided, otherwise use current EST time
    let expenseDate
    if (date) {
      expenseDate = new Date(date)
    } else {
      // Get current time in EST (UTC-5)
      const now = new Date()
      const estOffset = -5 * 60 // EST is UTC-5 (in minutes)
      const estTime = new Date(now.getTime() + estOffset * 60 * 1000)
      expenseDate = estTime
    }

    const expense = await prisma.expense.create({
      data: {
        userId: decodedToken.uid,
        category,
        subcategory,
        amount,
        description,
        date: expenseDate,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error("Error creating expense:", error)
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}
