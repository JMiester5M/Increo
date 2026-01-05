import { verifyStaffAccess } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"

export async function GET(request) {
  const { authorized, error } = await verifyStaffAccess(request)

  if (!authorized) {
    return NextResponse.json({ error }, { status: error === "Unauthorized" ? 401 : 403 })
  }

  return NextResponse.json({ access: "granted" })
}
