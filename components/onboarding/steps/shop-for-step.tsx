'use client'

import { ShoppingBag, User, Users, Gift } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAppStore } from '@/lib/store'
import type { ShopFor } from '@/lib/types'

const shopForOptions = [
  { value: 'self', label: 'Myself', description: 'Personal wardrobe', icon: User },
  { value: 'family', label: 'Family', description: 'Multiple people', icon: Users },
  { value: 'gifts', label: 'Gifts', description: 'For others', icon: Gift },
]

export function ShopForStep() {
  const { preferences, updatePreferences } = useAppStore()

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <ShoppingBag className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Who are you shopping for?</h2>
        <p className="text-muted-foreground">
          This helps us personalize your recommendations
        </p>
      </div>

      <RadioGroup
        value={preferences.shopFor}
        onValueChange={(value) => updatePreferences({ shopFor: value as ShopFor })}
        className="grid gap-4"
      >
        {shopForOptions.map((option) => (
          <Label
            key={option.value}
            htmlFor={`shopfor-${option.value}`}
            className="flex items-center gap-4 rounded-xl border-2 border-border bg-card p-5 cursor-pointer transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <RadioGroupItem value={option.value} id={`shopfor-${option.value}`} className="sr-only" />
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
              <option.icon className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{option.label}</div>
              <div className="text-sm text-muted-foreground">{option.description}</div>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}
