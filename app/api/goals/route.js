import { verifyFirebaseToken } from "@/lib/auth-helpers"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const decodedToken = await verifyFirebaseToken(request)
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goals = await prisma.goal.findMany({
      where: { userId: decodedToken.uid },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const decodedToken = await verifyFirebaseToken(request)
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, targetAmount, deadline } = body

    const goal = await prisma.goal.create({
      data: {
        userId: decodedToken.uid,
        title,
        description,
        targetAmount,
        deadline: deadline ? new Date(deadline) : null,
      },
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}
