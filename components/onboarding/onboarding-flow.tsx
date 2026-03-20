'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MapPin, Wallet, Palette, User, Heart, ShoppingBag, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LocationStep } from './steps/location-step'
import { CurrencyStep } from './steps/currency-step'
import { SkinToneStep } from './steps/skin-tone-step'
import { BodyTypeStep } from './steps/body-type-step'
import { StyleStep } from './steps/style-step'
import { ShopForStep } from './steps/shop-for-step'
import { useAppStore } from '@/lib/store'

const steps = [
  { id: 'location', title: 'Location & Climate', icon: MapPin },
  { id: 'currency', title: 'Currency', icon: Wallet },
  { id: 'skin-tone', title: 'Skin Tone', icon: Palette },
  { id: 'body-type', title: 'Body Type', icon: User },
  { id: 'style', title: 'Style Preferences', icon: Heart },
  { id: 'shop-for', title: 'Shopping For', icon: ShoppingBag },
]

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showWelcome, setShowWelcome] = useState(true)
  const { updatePreferences } = useAppStore()

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    updatePreferences({ onboardingCompleted: true })
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg w-full text-center space-y-8"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance">
              Welcome to Retail-Genie
            </h1>
            <p className="text-lg text-muted-foreground text-balance leading-relaxed">
              Your worldwide AI stylist - find exactly what fits you, your life and your planet
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <Button
              size="lg"
              className="w-full h-14 text-lg gap-2"
              onClick={() => setShowWelcome(false)}
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Photos are processed temporarily and deleted immediately after use. We never store personal images.
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {steps[currentStep].title}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && <LocationStep />}
              {currentStep === 1 && <CurrencyStep />}
              {currentStep === 2 && <SkinToneStep />}
              {currentStep === 3 && <BodyTypeStep />}
              {currentStep === 4 && <StyleStep />}
              {currentStep === 5 && <ShopForStep />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border/40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button size="lg" onClick={handleNext} className="gap-2">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="lg" onClick={handleComplete} className="gap-2">
              Start Shopping
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
