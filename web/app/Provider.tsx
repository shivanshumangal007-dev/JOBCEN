"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { GoogleOAuthProvider } from "@react-oauth/google"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  
  // NOTE: Provide a fallback empty string if env variable is missing to prevent crashes during dev, 
  // but Google Login will only work once NEXT_PUBLIC_GOOGLE_CLIENT_ID is set in .env
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}