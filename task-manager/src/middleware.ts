import { NextResponse } from "next/server";

import { auth } from "@/auth";

// Публичные роуты - доступны без авторизации
const publicRoutes = ["/signin", "/signup", "/api/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Проверяем, является ли роут публичным
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  
  if (isPublic) {
    // Если пользователь уже авторизован и пытается зайти на страницы входа/регистрации - редиректим на главную
    if (req.auth && (pathname === "/signin" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Если пользователь не авторизован и пытается зайти на защищенный роут - редиректим на вход
  if (!req.auth) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (NextAuth API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
