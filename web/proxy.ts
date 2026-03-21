import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get("auth_token")?.value;

  if (authToken) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/auth/login", request.url);

  return NextResponse.redirect(loginUrl);
}
