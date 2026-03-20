'use client'

import { Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { styleOptions } from '@/lib/mock-data'
import type { StylePreference } from '@/lib/types'

export function StyleStep() {
  const { preferences, updatePreferences } = useAppStore()

  const toggleStyle = (style: StylePreference) => {
    const current = preferences.stylePreferences
    const updated = current.includes(style)
      ? current.filter((s) => s !== style)
      : [...current, style]
    updatePreferences({ stylePreferences: updated })
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Heart className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Style Preferences</h2>
        <p className="text-muted-foreground">
          Select all the styles that resonate with you
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {styleOptions.map((option) => {
          const isSelected = preferences.stylePreferences.includes(option.value as StylePreference)
          return (
            <Badge
              key={option.value}
              variant={isSelected ? 'default' : 'outline'}
              className={`text-base px-4 py-2 cursor-pointer transition-all hover:scale-105 ${
                isSelected 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-primary/10'
              }`}
              onClick={() => toggleStyle(option.value as StylePreference)}
            >
              {option.label}
            </Badge>
          )
        })}
      </div>

      {preferences.stylePreferences.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {preferences.stylePreferences.length} style{preferences.stylePreferences.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  )
}
