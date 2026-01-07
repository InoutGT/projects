import { NextRequest, NextResponse } from "next/server";

// Публичные роуты - доступны без авторизации
const publicRoutes = ["/signin", "/signup", "/api/register", "/api/auth"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверяем, является ли роут публичным
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  
  if (isPublic) {
    // Для публичных роутов просто пропускаем запрос
    // Детальная проверка авторизации происходит на уровне страниц
    return NextResponse.next();
  }

  // Для защищенных роутов также пропускаем
  // Защита происходит на уровне страниц через auth() и redirect()
  // Это позволяет избежать проблем с Prisma в Edge Runtime
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
