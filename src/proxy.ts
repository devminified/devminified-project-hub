import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET)

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("session")?.value
  if (!token) return false
  try {
    await jwtVerify(token, encodedKey, { algorithms: ["HS256"] })
    return true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicPage = pathname === "/login" || pathname === "/signup"
  const authed = await hasValidSession(request)

  // Logged-in users shouldn't see the login or signup pages.
  if (isPublicPage) {
    if (authed) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Everything else requires a session.
  if (!authed) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Run on all routes except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
}
