'use client'

import { useEffect, useState } from 'react'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { MainApp } from '@/components/main-app'
import { useAppStore } from '@/lib/store'

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false)
  const { preferences } = useAppStore()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Show nothing while hydrating to prevent flash
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Show onboarding if not completed
  if (!preferences.onboardingCompleted) {
    return <OnboardingFlow />
  }

  // Show main app
  return <MainApp />
}
