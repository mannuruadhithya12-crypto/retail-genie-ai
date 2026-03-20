'use client'

import { Palette } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAppStore } from '@/lib/store'
import { skinToneOptions } from '@/lib/mock-data'
import type { SkinTone } from '@/lib/types'

export function SkinToneStep() {
  const { preferences, updatePreferences } = useAppStore()

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Palette className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Your Skin Tone</h2>
        <p className="text-muted-foreground">
          Helps us recommend colors that complement you
        </p>
      </div>

      <RadioGroup
        value={preferences.skinTone}
        onValueChange={(value) => updatePreferences({ skinTone: value as SkinTone })}
        className="flex flex-wrap justify-center gap-4"
      >
        {skinToneOptions.map((option) => (
          <Label
            key={option.value}
            htmlFor={`skin-${option.value}`}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <RadioGroupItem value={option.value} id={`skin-${option.value}`} className="sr-only" />
            <div
              className="w-14 h-14 rounded-full border-4 border-transparent transition-all group-hover:scale-110 has-[:checked]:border-primary has-[:checked]:ring-4 has-[:checked]:ring-primary/20"
              style={{ backgroundColor: option.color }}
            />
            <span className="text-xs text-muted-foreground group-has-[:checked]:text-primary group-has-[:checked]:font-medium">
              {option.label}
            </span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}
