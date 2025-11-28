'use client'

import { AuthenticateWithRedirectCallback, useClerk } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import HexwaveLoader from '@/app/components/common/HexwaveLoader'
import { RefreshCw, AlertCircle } from 'lucide-react'

// =============================================================================
// CONSTANTS
// =============================================================================

const SSO_CALLBACK_TIMEOUT = 30000 // 30 seconds
const MAX_RETRY_ATTEMPTS = 2

// Error messages mapping
const ERROR_MESSAGES: Record<string, string> = {
  oauth_callback_error: "Authentication failed. Please try again.",
  identifier_not_found: "We couldn't create your account. Please try again.",
  identifier_exists: "An account with this email already exists. Please sign in instead.",
  access_denied: "Access was denied. Please try again or use a different method.",
  server_error: "Server error occurred. Please try again later.",
  network_error: "Network error. Please check your connection.",
  timeout: "Authentication is taking too long. Please try again.",
  default: "Something went wrong during sign up. Please try again.",
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function SSOCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clerk = useClerk()
  
  const [error, setError] = useState<string | null>(null)
  const [isTimeout, setIsTimeout] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [shouldRedirectToSignIn, setShouldRedirectToSignIn] = useState(false)
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mounted = useRef(true)

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  // Check for error in URL params
  useEffect(() => {
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    
    if (errorParam) {
      const message = ERROR_MESSAGES[errorParam] || errorDescription || ERROR_MESSAGES.default
      setError(message)
      
      // If account exists, suggest sign-in
      if (errorParam === 'identifier_exists') {
        setShouldRedirectToSignIn(true)
      }
    }
  }, [searchParams])

  // Set timeout for callback
  useEffect(() => {
    mounted.current = true
    
    timeoutRef.current = setTimeout(() => {
      if (mounted.current && !error) {
        setIsTimeout(true)
        setError(ERROR_MESSAGES.timeout)
      }
    }, SSO_CALLBACK_TIMEOUT)

    return () => {
      mounted.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [error])

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleRetry = useCallback(() => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      router.push('/sign-up')
      return
    }
    
    setRetryCount(prev => prev + 1)
    setError(null)
    setIsTimeout(false)
    setShouldRedirectToSignIn(false)
    
    // Reload the page to retry the callback
    window.location.reload()
  }, [retryCount, router])

  const handleGoBack = useCallback(() => {
    router.push(shouldRedirectToSignIn ? '/sign-in' : '/sign-up')
  }, [router, shouldRedirectToSignIn])

  // ==========================================================================
  // RENDER
  // ==========================================================================

  // Error state
  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6 max-w-md text-center px-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Sign Up Failed</h2>
            <p className="text-white/60 text-sm">{error}</p>
          </div>

          <div className="flex gap-3">
            {retryCount < MAX_RETRY_ATTEMPTS && !shouldRedirectToSignIn && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            )}
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-[#74FF52] hover:bg-[#66e648] text-black font-medium rounded-lg transition-all"
            >
              {shouldRedirectToSignIn 
                ? 'Go to Sign In' 
                : retryCount >= MAX_RETRY_ATTEMPTS 
                  ? 'Back to Sign Up' 
                  : 'Choose Another Method'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      <HexwaveLoader message="Completing sign up..." size="lg" />
      <AuthenticateWithRedirectCallback 
        signInForceRedirectUrl="/explore"
        signUpForceRedirectUrl="/explore"
        continueSignUpUrl="/sign-up"
        afterSignInUrl="/explore"
        afterSignUpUrl="/explore"
      />
    </div>
  )
}
