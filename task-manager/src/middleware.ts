// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // В NextAuth v5 куки могут называться по-разному в зависимости от окружения
  const token = request.cookies.get('next-auth.session-token') || 
                request.cookies.get('__Secure-next-auth.session-token')
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/signin') || 
                     request.nextUrl.pathname.startsWith('/signup')
  
  const isProtectedPage = !request.nextUrl.pathname.startsWith('/api') &&
                          !isAuthPage &&
                          !request.nextUrl.pathname.startsWith('/_next') &&
                          !request.nextUrl.pathname.startsWith('/favicon')

  // Если нет токена и пытается зайти на защищённую страницу
  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Если есть токен и пытается зайти на страницу входа
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Применяется ко всем путям кроме:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}