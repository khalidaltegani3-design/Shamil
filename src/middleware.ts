import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // إضافة charset فقط للصفحات HTML، وليس للأصول الثابتة
  if (request.nextUrl.pathname.includes('.')) {
    // إذا كان الطلب لملف (يحتوي على نقطة)، لا نضيف headers
    return response
  }
  
  // إضافة charset للصفحات HTML فقط
  response.headers.set('Content-Type', 'text/html; charset=utf-8')
  
  // التحقق من المسارات المحمية
  const { pathname } = request.nextUrl
  
  // المسارات العامة التي لا تحتاج مصادقة
  const publicPaths = [
    '/',
    '/login',
    '/login/employee',
    '/login/supervisor', 
    '/signup',
    '/test'
  ]
  
  // إذا كان المسار عام، نسمح بالوصول
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return response
  }
  
  // للمسارات المحمية، نتحقق من وجود token المصادقة
  // في هذه المرحلة، سنعتمد على client-side authentication checking
  // لأن Firebase Auth tokens تتم إدارتها من جانب العميل
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}