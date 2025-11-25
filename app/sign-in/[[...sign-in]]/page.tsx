'use client'

import { SignIn, SignUp, useSignIn, useSignUp, useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import HexwaveLoader from '@/app/components/common/HexwaveLoader'

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, setActive, isLoaded } = useSignIn()
  const { signUp, isLoaded: signUpLoaded, setActive: setActiveSignUp } = useSignUp()
  const { isSignedIn } = useUser()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isSignUpFlow, setIsSignUpFlow] = useState(false) // Track if we're in sign-up flow

  // Handle OAuth sign-in (supports both sign-in and auto sign-up)
  const handleOAuthSignIn = async (strategy: 'oauth_google' | 'oauth_apple') => {
    // Prevent multiple clicks
    if (isLoading) return
    
    if (!isLoaded || !signIn || !signUpLoaded || !signUp) {
      setError('Authentication service is not ready. Please refresh the page.')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      // First try sign-in for existing users
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-in/sso-callback',
        redirectUrlComplete: '/explore',
      })
    } catch {
      // If sign-in fails (user doesn't exist), try sign-up
      console.log('Sign-in failed, trying sign-up for new user')
      try {
        await signUp.authenticateWithRedirect({
          strategy,
          redirectUrl: '/sign-up/sso-callback',
          redirectUrlComplete: '/explore',
        })
      } catch (signUpErr: unknown) {
        const error = signUpErr as { errors?: Array<{ message?: string }> } | Error
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError(error.errors?.[0]?.message || 'Failed to authenticate. Please try again.')
        }
        setIsLoading(false)
      }
    }
  }

  // Video URLs from effectsData.ts (lines 2-21)
  const videos = [
    {
      url: "https://cdn.higgsfield.ai/kling_motion/8c4795a8-e7ef-4272-8fb3-9d349192a013.mp4",
      poster: "https://cdn.higgsfield.ai/kling_motion/94b61df4-fff8-4c97-8115-59d8f2fcd93d.webp",
      name: "Raven Transition"
    },
    {
      url: "https://cdn.higgsfield.ai/kling_motion/413e9bed-2fb7-4f61-b69f-e8c7466bfcf6.mp4",
      poster: "https://cdn.higgsfield.ai/kling_motion/c55aaeff-aff4-4555-829e-3ffdc193df7f.webp",
      name: "Splash Transition"
    },
    {
      url: "https://cdn.higgsfield.ai/wan2_2_motion/22b6f9ca-5469-4086-8956-a2deb4944307.mp4",
      poster: "https://cdn.higgsfield.ai/wan2_2_motion/792e4782-a153-4cd6-a4dc-9470fa92a39a.webp",
      name: "Ahegao"
    },
    {
      url: "https://cdn.higgsfield.ai/kling_motion/ecb6fc91-c4df-4133-95da-5e53108a7c6f.mp4",
      poster: "https://cdn.higgsfield.ai/kling_motion/0fb7068a-f7f0-470b-8b81-3ee5f99da7c9.webp",
      name: "Flying Cam Transition"
    }
  ]

  // Check if user is already signed in - redirect to explore
  useEffect(() => {
    if (isSignedIn) {
      console.log('User already signed in, redirecting to /explore')
      router.replace('/explore')
    }
  }, [isSignedIn, router])

  // Check if we're in email verification flow
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam && signIn?.status === 'needs_first_factor') {
      setEmail(emailParam)
      setShowEmailInput(true)
      setShowCodeInput(true)
    }
  }, [searchParams, signIn?.status])

  // Handle video end and cycle to next
  const handleVideoEnd = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % 4)
  }

  // Auto-play video when it changes
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    // Ensure video plays when source changes
    const playVideo = async () => {
      try {
        videoElement.load()
        await videoElement.play()
      } catch (err) {
        console.error('Error playing video:', err)
      }
    }

    playVideo()
  }, [currentVideoIndex])

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    
    if (!isLoaded || !signIn || !signUpLoaded || !signUp) {
      setError('Authentication service is loading. Please try again.')
      return
    }

    setIsLoading(true)
    try {
      // First, try to sign in
      const result = await signIn.create({
        identifier: email.trim().toLowerCase(),
      })

      // Check if email verification code is needed
      if (result.status === 'needs_first_factor') {
        // Get the email address ID from supported first factors
        const emailFactor = result.supportedFirstFactors?.find(
          (factor) => factor.strategy === 'email_code'
        )
        
        if (emailFactor && 'emailAddressId' in emailFactor) {
          // Prepare email code verification
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailFactor.emailAddressId,
          })
          setIsSignUpFlow(false)
          setShowCodeInput(true)
        } else {
          setError('Email verification is not available. Please try another method.')
        }
      } else if (result.status === 'complete') {
        // If sign-in is complete, set active session
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId })
          router.push('/explore')
        }
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message?: string; code?: string }> }
      const errorCode = error.errors?.[0]?.code
      
      // If user doesn't exist, automatically create account
      if (errorCode === 'form_identifier_not_found') {
        try {
          // Automatically sign up the user
          const signUpResult = await signUp.create({
            emailAddress: email.trim().toLowerCase(),
          })

          // Prepare email verification
          if (signUpResult.status === 'missing_requirements') {
            await signUp.prepareEmailAddressVerification({
              strategy: 'email_code',
            })
            setIsSignUpFlow(true)
            setShowCodeInput(true)
            setError('') // Clear any previous errors
          } else if (signUpResult.status === 'complete') {
            if (signUpResult.createdSessionId) {
              await setActiveSignUp({ session: signUpResult.createdSessionId })
              router.push('/explore')
            }
          }
        } catch (signUpErr: unknown) {
          const signUpError = signUpErr as { errors?: Array<{ message?: string }> }
          setError(signUpError.errors?.[0]?.message || 'Failed to create account. Please try again.')
        }
      } else {
        setError(error.errors?.[0]?.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle email code verification
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate code format
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Please enter a valid 6-digit code')
      return
    }
    
    if (!isLoaded || !signIn || !signUpLoaded || !signUp) {
      setError('Authentication service is loading. Please try again.')
      return
    }

    setIsLoading(true)
    try {
      if (isSignUpFlow) {
        // We're in sign-up flow (auto-created account)
        const result = await signUp.attemptEmailAddressVerification({
          code,
        })

        if (result.status === 'complete') {
          if (result.createdSessionId) {
            await setActiveSignUp({ session: result.createdSessionId })
            router.push('/explore')
          }
        } else {
          setError('Verification failed. Please try again.')
        }
      } else {
        // We're in sign-in flow (existing account)
        const result = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code,
        })

        if (result.status === 'complete') {
          if (result.createdSessionId) {
            await setActive({ session: result.createdSessionId })
            router.push('/explore')
          }
        } else {
          setError('Verification failed. Please try again.')
        }
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message?: string; code?: string }> }
      const errorCode = error.errors?.[0]?.code
      
      // Provide user-friendly error messages
      if (errorCode === 'form_code_incorrect') {
        setError('Invalid verification code. Please check and try again.')
      } else if (errorCode === 'form_code_expired') {
        setError('Verification code has expired. Please request a new one.')
      } else {
        setError(error.errors?.[0]?.message || 'Invalid code. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }


  // Show loading while checking auth status
  if (isSignedIn) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <HexwaveLoader message="Already signed in. Redirecting..." size="lg" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Side - Video Player */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
        {/* Video element that auto-cycles */}
        <video
          ref={videoRef}
          key={currentVideoIndex}
          className="absolute inset-0 w-full h-full object-cover"
          poster={videos[currentVideoIndex].poster}
          autoPlay
          muted
          playsInline
          loop={false}
          onEnded={handleVideoEnd}
        >
          <source src={videos[currentVideoIndex].url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
         
      </div>

      {/* Right Side - Sign In UI */}
      <div className="flex-1 lg:w-1/2 bg-black relative flex items-center justify-center p-8">
        {/* Close Button */}
        <button
          onClick={() => router.push('/explore')}
          className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Sign In Content */}
        <div className="w-full max-w-md space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-serif text-white tracking-tight italic">
              Welcome to Hexwave.ai
            </h1>
          </div>

          {/* Sign In Options */}
          <div className="space-y-4">
            {/* Google Sign In */}
            <button 
              onClick={() => handleOAuthSignIn('oauth_google')}
              disabled={isLoading}
              className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-lg border-0 font-normal text-base flex items-center justify-center gap-3 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            {/* Apple Sign In */}
            <button 
              onClick={() => handleOAuthSignIn('oauth_apple')}
              disabled={isLoading}
              className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-lg border-0 font-normal text-base flex items-center justify-center gap-3 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Sign in with Apple
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="flex-shrink mx-4 text-white/60 text-sm">or</span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>

            {/* Email Sign In */}
            {!showEmailInput && !showCodeInput ? (
              <button
                onClick={() => setShowEmailInput(true)}
                className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-lg border-0 font-normal text-base flex items-center justify-center gap-3 cursor-pointer transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Sign in with email
              </button>
            ) : showCodeInput ? (
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">
                    Verification code
                  </label>
                  <p className="text-white/40 text-xs mb-3">
                    {isSignUpFlow 
                      ? `Account created! We sent a verification code to ${email}` 
                      : `We sent a verification code to ${email}`
                    }
                  </p>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="w-full h-12 bg-white text-black rounded-lg border-0 px-4 text-base placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-white/50 text-center text-2xl tracking-widest"
                    required
                    disabled={isLoading || !isLoaded}
                    autoFocus
                    maxLength={6}
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowCodeInput(false)
                      setCode('')
                      setError('')
                    }}
                    className="flex-1 h-12 bg-transparent border border-white/20 text-white hover:bg-white/10 rounded-lg font-normal text-base"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !code || code.length !== 6 || !isLoaded}
                    className="flex-1 h-12 bg-gray-800 text-white hover:bg-gray-700 rounded-lg border-0 font-normal text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (isSignUpFlow && signUp && signUpLoaded) {
                      try {
                        await signUp.prepareEmailAddressVerification({
                          strategy: 'email_code',
                        })
                        setError('')
                        alert('Verification code resent!')
                      } catch (err: unknown) {
                        const error = err as { errors?: Array<{ message?: string }> }
                        setError(error.errors?.[0]?.message || 'Failed to resend code')
                      }
                    } else if (!isSignUpFlow && signIn && isLoaded) {
                      try {
                        // Get the email address ID from supported first factors
                        const emailFactor = signIn.supportedFirstFactors?.find(
                          (factor) => factor.strategy === 'email_code'
                        )
                        
                        if (emailFactor && 'emailAddressId' in emailFactor) {
                          await signIn.prepareFirstFactor({
                            strategy: 'email_code',
                            emailAddressId: emailFactor.emailAddressId,
                          })
                          setError('')
                          alert('Verification code resent!')
                        }
                      } catch (err: unknown) {
                        const error = err as { errors?: Array<{ message?: string }> }
                        setError(error.errors?.[0]?.message || 'Failed to resend code')
                      }
                    }
                  }}
                  className="text-green-400 hover:text-green-300 text-sm underline w-full text-center"
                >
                  Resend code
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full h-12 bg-white text-black rounded-lg border-0 px-4 text-base placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                    disabled={isLoading || !isLoaded}
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowEmailInput(false)
                      setEmail('')
                      setError('')
                    }}
                    className="flex-1 h-12 bg-transparent border border-white/20 text-white hover:bg-white/10 rounded-lg font-normal text-base"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !email || !isLoaded}
                    className="flex-1 h-12 bg-gray-800 text-white hover:bg-gray-700 rounded-lg border-0 font-normal text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Continue'}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Terms and Privacy */}
          <p className="text-xs text-white/60 text-center leading-relaxed">
            By clicking &quot;Sign in with Google&quot;, &quot;Sign in with Apple&quot; or
            &quot;Sign in with email&quot;, you agree to our{' '}
            <a
              href="/terms"
              className="text-green-400 hover:text-green-300 underline"
            >
              Terms of Service
            </a>{' '}
            and acknowledge that you have read and understand our{' '}
            <a
              href="/privacy"
              className="text-green-400 hover:text-green-300 underline"
            >
              Privacy Policy
            </a>
            .
          </p>

          {/* Link to Sign Up */}
          <p className="text-sm text-white/60 text-center">
            Don&apos;t have an account?{' '}
            <a
              href="/sign-up"
              className="text-green-400 hover:text-green-300 underline"
            >
              Sign up
            </a>
          </p>
        </div>

        {/* Clerk components for OAuth SSO callback handling */}
        <div className="hidden">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl="/explore"
          />
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/explore"
          />
        </div>
      </div>
    </div>
  )
}
