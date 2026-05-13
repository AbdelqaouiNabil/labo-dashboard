import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const isLoginPage = request.nextUrl.pathname === "/login";

  const session = token ? await verifyToken(token) : null;

  if (!session && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (session && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
