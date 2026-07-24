import { api } from "@/hooks/utils"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// async function getCurrentUser() {
//   const cookieStore = await cookies()

//   const response = await api.get("/profile/me")
//   console.log(response.data)
//   if (!response.data) return null
//   return response.data
// }

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // const user = await getCurrentUser()

  // if (!user) {
  //   redirect("/login")
  // }

  return <>{children}</>
}