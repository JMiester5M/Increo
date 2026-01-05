import { verifyStaffAccess } from "@/lib/auth-helpers"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request) {
  const { authorized, error } = await verifyStaffAccess(request)

  if (!authorized) {
    return NextResponse.json({ error }, { status: error === "Unauthorized" ? 401 : 403 })
  }

  try {
    // Get 7 days ago (one week)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const [totalUsers, completedGoals, activeUsers, inactiveUsers] = await Promise.all([
      prisma.user.count(),
      prisma.goal.count({
        where: {
          completed: true
        }
      }),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: oneWeekAgo
          }
        }
      }),
      prisma.user.count({
        where: {
          updatedAt: {
            lt: oneWeekAgo
          }
        }
      })
    ])

    return NextResponse.json({
      totalUsers,
      completedGoals,
      activeUsers,
      inactiveUsers
    })
  } catch (error) {
    console.error("Error fetching staff stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
