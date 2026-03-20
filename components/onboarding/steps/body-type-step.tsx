'use client'

import { User } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAppStore } from '@/lib/store'
import { bodyTypeOptions } from '@/lib/mock-data'
import type { BodyType } from '@/lib/types'

export function BodyTypeStep() {
  const { preferences, updatePreferences } = useAppStore()

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <User className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Your Body Type</h2>
        <p className="text-muted-foreground">
          We will suggest fits that flatter your shape
        </p>
      </div>

      <RadioGroup
        value={preferences.bodyType}
        onValueChange={(value) => updatePreferences({ bodyType: value as BodyType })}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {bodyTypeOptions.map((option) => (
          <Label
            key={option.value}
            htmlFor={`body-${option.value}`}
            className="flex items-center gap-4 rounded-xl border-2 border-border bg-card p-4 cursor-pointer transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <RadioGroupItem value={option.value} id={`body-${option.value}`} className="sr-only" />
            <span className="text-3xl">{option.icon}</span>
            <span className="font-medium">{option.label}</span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}
