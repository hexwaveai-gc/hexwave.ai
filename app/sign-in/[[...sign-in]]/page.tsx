'use client'

import { SignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

export default function Page() {
  const router = useRouter()

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
          {/* Placeholder for artistic image - you can replace this with an actual image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/20 text-6xl font-serif italic">
              Hexwave.ai
            </div>
          </div>
        </div>
        {/* You can add an actual image here */}
        {/* <Image
          src="/images/signin-hero.jpg"
          alt="Hexwave.ai"
          fill
          className="object-cover"
          priority
        /> */}
      </div>

      {/* Right Side - Sign In UI */}
      <div className="flex-1 lg:w-1/2 bg-black relative flex items-center justify-center p-8">
        {/* Close Button */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Clerk Sign In Component with Custom Styling */}
        <div className="w-full max-w-md">
          <SignIn
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-transparent shadow-none border-0',
                headerTitle: 'text-white text-4xl font-serif tracking-tight text-center mb-8',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton:
                  'bg-white text-black hover:bg-white/90 rounded-lg border-0 font-normal text-base h-12 flex items-center justify-center gap-3 transition-all',
                socialButtonsBlockButtonText: 'text-base font-normal',
                socialButtonsBlockButtonArrow: 'hidden',
                dividerLine: 'bg-white/20',
                dividerText: 'text-white/60 text-sm',
                formFieldInput:
                  'bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 rounded-lg',
                formFieldLabel: 'text-white/80',
                formButtonPrimary:
                  'bg-white text-black hover:bg-white/90 rounded-lg border-0 font-normal text-base h-12',
                footerActionLink: 'text-green-400 hover:text-green-300',
                identityPreviewText: 'text-white',
                identityPreviewEditButton: 'text-white/60 hover:text-white',
                formResendCodeLink: 'text-green-400 hover:text-green-300',
                alertText: 'text-white/80',
                formHeaderTitle: 'text-white',
                formHeaderSubtitle: 'text-white/60',
                socialButtonsIconButton: 'bg-white text-black hover:bg-white/90 rounded-lg',
              },
              layout: {
                socialButtonsPlacement: 'top',
                showOptionalFields: false,
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/"
          />

          {/* Terms and Privacy - Custom Footer */}
          <p className="text-xs text-white/60 text-center leading-relaxed mt-6">
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
        </div>
      </div>
    </div>
  )
}
