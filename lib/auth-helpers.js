import { adminAuth } from "@/lib/firebase-admin"

export async function verifyFirebaseToken(request) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.split("Bearer ")[1]
    const decodedToken = await adminAuth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}
