"use client"

import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function AuthProvider({ children }) {
  const [user, loading] = useAuthState(auth)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      const protectedRoutes = ["/dashboard", "/goals", "/spending", "/profile", "/survey"]
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
      
      if (isProtectedRoute && !user) {
        router.push("/")
      }
    }
  }, [user, loading, pathname, router])

  return children
}
