"use client"

import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { useEffect, useState } from "react"

export function useStaffAccess() {
  const [user] = useAuthState(auth)
  const [isStaff, setIsStaff] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsStaff(false)
      setLoading(false)
      return
    }

    const checkAccess = async () => {
      try {
        const token = await user.getIdToken()
        const res = await fetch("/api/staff/access", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setIsStaff(res.ok)
      } catch (error) {
        setIsStaff(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [user])

  return { isStaff, loading }
}
