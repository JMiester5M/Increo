import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request) {
  try {
    const body = await request.json()
    const { uid, email, name, image, checkOnly } = body

    console.log("User sync request:", { uid, email, name, checkOnly })

    if (!uid || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // If checkOnly flag is set, just check if user exists
    if (checkOnly) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      console.log("Check only result:", { exists: !!existingUser, email })
      
      return NextResponse.json({ 
        exists: !!existingUser,
        user: existingUser 
      })
    }

    // Upsert user in database (for registration/update)
    // First check if user already exists by email to prevent duplicate creation
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log("User exists, updating:", email)
      // User already exists, just update their info
      const user = await prisma.user.update({
        where: { email },
        data: {
          name,
          image,
        },
      })
      return NextResponse.json({ success: true, user, existing: true })
    }

    console.log("Creating new user:", { uid, email, name })
    // Create new user
    const user = await prisma.user.create({
      data: {
        id: uid,
        email,
        name,
        image,
      },
    })

    console.log("User created successfully:", user.id)
    return NextResponse.json({ success: true, user, existing: false })
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json({ 
      error: "Failed to sync user", 
      details: error.message 
    }, { status: 500 })
  }
}
