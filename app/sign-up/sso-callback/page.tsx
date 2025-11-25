'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import HexwaveLoader from '@/app/components/common/HexwaveLoader'

export default function SSOCallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      <HexwaveLoader message="Completing sign up..." size="lg" />
      <AuthenticateWithRedirectCallback 
        signInForceRedirectUrl="/explore"
        signUpForceRedirectUrl="/explore"
      />
    </div>
  )
}

