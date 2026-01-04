import { verifyFirebaseToken } from "@/lib/auth-helpers"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const decodedToken = await verifyFirebaseToken(request)
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    const expense = await prisma.expense.create({
      data: {
        userId: decodedToken.uid,
        category,
        subcategory,
        amount,
        description,
        date: date ? new Date(date) : new Date(),
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error("Error creating expense:", error)
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}
