'use client'

import { Wallet } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAppStore } from '@/lib/store'
import { currencyOptions } from '@/lib/mock-data'
import type { Currency } from '@/lib/types'

export function CurrencyStep() {
  const { preferences, updatePreferences } = useAppStore()

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Wallet className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Preferred Currency</h2>
        <p className="text-muted-foreground">
          We will display all prices in your preferred currency
        </p>
      </div>

      <RadioGroup
        value={preferences.currency}
        onValueChange={(value) => updatePreferences({ currency: value as Currency })}
        className="grid grid-cols-2 gap-3"
      >
        {currencyOptions.map((option) => (
          <Label
            key={option.value}
            htmlFor={option.value}
            className="flex items-center gap-3 rounded-xl border-2 border-border bg-card p-4 cursor-pointer transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
            <span className="text-2xl font-semibold text-primary">{option.symbol}</span>
            <div className="flex-1">
              <div className="font-medium">{option.value}</div>
              <div className="text-sm text-muted-foreground">{option.label}</div>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}
