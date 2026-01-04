import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request) {
  try {
    const body = await request.json()
    const { uid, email, name, image } = body

    if (!uid || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        image,
      },
      create: {
        id: uid,
        email,
        name,
        image,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 })
  }
}
