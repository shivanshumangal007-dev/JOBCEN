"use client"

import { ProfileLoader } from "@/components/Animated-Loader"
import { useProfile } from "@/hooks/Profile"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const token = Cookies.get("access_token")
  
  // Call the hook at the top level of the component
  const { data: user, isLoading } = useProfile()

  useEffect(() => {
    // Redirect if no token or if we finished loading but still have no user
    if (!token || (!isLoading && !user)) {
      router.push("/login")
    }
  }, [token, user, isLoading, router])

  // Show nothing (or a loading spinner) while checking authentication
  if (!token || isLoading || !user) {
    return <ProfileLoader/>
  }

  return <>{children}</>
  // return <ProfileLoader/>
}