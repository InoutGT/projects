// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Пропускаем API, статику и фавикон
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('.') // файлы
  ) {
    return NextResponse.next()
  }

  // Получаем токен
  const token = request.cookies.get('next-auth.session-token')?.value || 
                request.cookies.get('__Secure-next-auth.session-token')?.value
  
  const isAuthPage = pathname.startsWith('/signin') || pathname.startsWith('/signup')
  
  // Если нет токена и пытается зайти на защищённую страницу
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Если есть токен и пытается зайти на страницу входа
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}