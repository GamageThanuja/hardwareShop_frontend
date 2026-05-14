import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  const isDashboard = pathname.startsWith("/dashboard");
  const isAuth = pathname.startsWith("/auth");

  if (isDashboard && !token) {
    const loginUrl = new URL("/auth/v1/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuth && token) {
    return NextResponse.redirect(new URL("/dashboard/default", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
