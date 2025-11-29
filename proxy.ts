/**
 * Next.js 16 Proxy (formerly middleware)
 * 
 * Handles:
 * - Security headers for all responses
 * - Clerk authentication routing
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// =============================================================================
// ROUTE MATCHERS
// =============================================================================

/**
 * Public routes that don't require authentication
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing(.*)',
  '/explore(.*)',
  '/api/webhook(.*)',
  '/api/paddle/webhook(.*)',
  '/api/clerk/webhook(.*)',
  '/api/uploadthing(.*)',
  '/api/health(.*)',
])

/**
 * API routes that need special handling
 */
const isApiRoute = createRouteMatcher(['/api/(.*)'])

// =============================================================================
// SECURITY HEADERS
// =============================================================================

/**
 * Security headers to add to all responses
 */
const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-DNS-Prefetch-Control': 'on',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
}

/**
 * Content Security Policy
 */
function getCSPHeader(isApi: boolean): string {
  if (isApi) {
    return "default-src 'none'; frame-ancestors 'none'"
  }

  const directives = [
    "default-src 'self'",
    // Allow Clerk scripts from their CDN domains
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.hexwave.ai https://cdn.jsdelivr.net https://cdn.paddle.com https://*.paddle.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.paddle.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com data:",
    // Extended connect-src for Clerk API calls
    "connect-src 'self' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://*.paddle.com https://*.cloudinary.com https://*.uploadthing.com https://*.ably.io wss://*.ably.io https://api.cloudinary.com",
    // Extended frame-src for Clerk components
    "frame-src 'self' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://*.paddle.com https://challenges.cloudflare.com",
    "media-src 'self' blob: https:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ]

  return directives.join('; ')
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse, isApi: boolean): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  response.headers.set('Content-Security-Policy', getCSPHeader(isApi))

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  return response
}

// =============================================================================
// PROXY HANDLER
// =============================================================================

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const isApi = isApiRoute(request)

  // Protect non-public routes (commented out for now - enable when ready)
  // if (!isPublicRoute(request)) {
  //   await auth.protect()
  // }

  // Create response with security headers
  const response = NextResponse.next()
  return addSecurityHeaders(response, isApi)
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}