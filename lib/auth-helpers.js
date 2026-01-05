import { adminAuth } from "@/lib/firebase-admin"
import prisma from "@/lib/prisma"

export async function verifyFirebaseToken(request) {
  try {
    const authHeader = request.headers.get("Authorization")
    console.log("Auth header:", authHeader ? "Present" : "Missing")
    
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Invalid auth header format")
      return null
    }

    const token = authHeader.split("Bearer ")[1]
    console.log("Token length:", token?.length)
    
    const decodedToken = await adminAuth.verifyIdToken(token)
    console.log("Token verified for user:", decodedToken.uid)
    return decodedToken
  } catch (error) {
    console.error("Error verifying token:", error.message)
    return null
  }
}

export async function verifyStaffAccess(request) {
  try {
    const decodedToken = await verifyFirebaseToken(request)
    if (!decodedToken) {
      return { authorized: false, error: "Unauthorized" }
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: { role: true }
    })

    if (!user || (user.role !== "staff" && user.role !== "admin")) {
      return { authorized: false, error: "Forbidden - Staff access required" }
    }

    return { authorized: true, userId: decodedToken.uid, role: user.role }
  } catch (error) {
    console.error("Error verifying staff access:", error)
    return { authorized: false, error: "Internal server error" }
  }
}
