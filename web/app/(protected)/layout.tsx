import { cookies } from "next/headers"
import { redirect } from "next/navigation"

async function getCurrentUser() {
  const cookieStore = await cookies()

  const response = await fetch(`${process.env.API_URL}/auth/me`, {
    headers: {
      Cookie: cookieStore.toString(), // forward the httpOnly cookie to your backend
    },
    cache: "no-store",
  })

  if (!response.ok) return null
  return response.json()
}

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <>{children}</>
}