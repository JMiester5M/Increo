import { NextResponse } from "next/server"
import { verifyFirebaseToken } from "@/lib/auth-helpers"
import prisma from "@/lib/prisma"

export async function GET(request) {
  try {
    const decodedToken = await verifyFirebaseToken(request)
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: { expenseCategories: true }
    })

    return NextResponse.json({ 
      categories: user?.expenseCategories || [] 
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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
    const { categories } = body

    const user = await prisma.user.update({
      where: { id: decodedToken.uid },
      data: { expenseCategories: categories }
    })

    return NextResponse.json({ 
      categories: user.expenseCategories 
    })
  } catch (error) {
    console.error("Error updating categories:", error)
    return NextResponse.json(
      { error: "Failed to update categories" },
      { status: 500 }
    )
  }
}
