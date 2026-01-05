import { verifyFirebaseToken } from "@/lib/auth-helpers"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const decodedToken = await verifyFirebaseToken(request)
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goal = await prisma.goal.findUnique({
      where: { id: params.id },
    })

    if (!goal || goal.userId !== decodedToken.uid) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Error fetching goal:", error)
    return NextResponse.json({ error: "Failed to fetch goal" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const decodedToken = await verifyFirebaseToken(request)
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goal = await prisma.goal.findUnique({
      where: { id: params.id },
    })

    if (!goal || goal.userId !== decodedToken.uid) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    const body = await request.json()
    const updateData = {}

    if (body.currentAmount !== undefined) updateData.currentAmount = body.currentAmount
    if (body.completed !== undefined) updateData.completed = body.completed
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.targetAmount !== undefined) updateData.targetAmount = body.targetAmount
    if (body.deadline !== undefined) updateData.deadline = body.deadline ? new Date(body.deadline) : null

    const updatedGoal = await prisma.goal.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedGoal)
  } catch (error) {
    console.error("Error updating goal:", error)
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const decodedToken = await verifyFirebaseToken(request)
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goal = await prisma.goal.findUnique({
      where: { id: params.id },
    })

    if (!goal || goal.userId !== decodedToken.uid) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    await prisma.goal.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting goal:", error)
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 })
  }
}
