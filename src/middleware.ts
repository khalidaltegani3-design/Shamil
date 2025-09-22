import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // إضافة headers أمان عامة
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  // إضافة charset فقط للصفحات HTML، وليس للأصول الثابتة
  if (!request.nextUrl.pathname.includes('.') && !request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Content-Type', 'text/html; charset=utf-8')
  }
  
  // التحقق من المسارات المحمية
  const { pathname } = request.nextUrl
  
  // المسارات العامة التي لا تحتاج مصادقة
  const publicPaths = [
    '/',
    '/login',
    '/login/employee',
    '/login/supervisor', 
    '/signup',
    '/test',
    '/forgot-password'
  ]
  
  // المسارات الثابتة والـ API
  const staticPaths = [
    '/_next',
    '/favicon.ico',
    '/manifest.json',
    '/images/',
    '/api/'
  ]
  
  // إذا كان المسار ثابت أو API، نسمح بالوصول
  if (staticPaths.some(path => pathname.startsWith(path))) {
    return response
  }
  
  // إذا كان المسار عام، نسمح بالوصول
  if (publicPaths.some(path => pathname === path)) {
    return response
  }
  
  // للمسارات المحمية، نتحقق من وجود token المصادقة
  // في بيئة App Hosting، نعتمد على client-side authentication
  // لأن Firebase Auth tokens تتم إدارتها من جانب العميل
  
  // إضافة header خاص للمسارات المحمية
  response.headers.set('X-Protected-Route', 'true')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes that should handle their own CORS
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, etc.
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|manifest\\.json).*)',
  ],
}