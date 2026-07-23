import { NextRequest, NextResponse } from "next/server"

const PROTECTED_PATHS = ["/dashboard", "/edit", "/updates", "/onboarding"]

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token") // match your backend's actual cookie name
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))

  if (isProtected && !accessToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname) // send them back after login
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/edit/:path*", "/updates/:path*", "/onboarding/:path*"],
}