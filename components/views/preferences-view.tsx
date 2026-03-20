'use client'

import { Settings, MapPin, Wallet, Palette, User, Heart, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import {
  climateOptions,
  currencyOptions,
  skinToneOptions,
  bodyTypeOptions,
  styleOptions,
} from '@/lib/mock-data'
import type { Currency, SkinTone, BodyType, StylePreference, ShopFor } from '@/lib/types'

const shopForOptions = [
  { value: 'self', label: 'Myself' },
  { value: 'family', label: 'Family' },
  { value: 'gifts', label: 'Gifts' },
]

export function PreferencesView() {
  const { preferences, updatePreferences, resetPreferences } = useAppStore()

  const toggleStyle = (style: StylePreference) => {
    const current = preferences.stylePreferences
    const updated = current.includes(style)
      ? current.filter((s) => s !== style)
      : [...current, style]
    updatePreferences({ stylePreferences: updated })
  }

  return (
    <ScrollArea className="flex-1 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Preferences</h1>
          </div>
          <Button variant="outline" onClick={resetPreferences}>
            Reset All
          </Button>
        </div>

        {/* Location & Climate */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Location & Climate</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">City or Region</Label>
              <Input
                id="location"
                value={preferences.location}
                onChange={(e) => updatePreferences({ location: e.target.value })}
                placeholder="e.g., New York"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="climate">Climate Type</Label>
              <Select
                value={preferences.climate}
                onValueChange={(value) => updatePreferences({ climate: value })}
              >
                <SelectTrigger id="climate">
                  <SelectValue placeholder="Select climate" />
                </SelectTrigger>
                <SelectContent>
                  {climateOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Currency */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Currency</h2>
          </div>
          <Select
            value={preferences.currency}
            onValueChange={(value) => updatePreferences({ currency: value as Currency })}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.symbol} {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Skin Tone */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Skin Tone</h2>
          </div>
          <RadioGroup
            value={preferences.skinTone}
            onValueChange={(value) => updatePreferences({ skinTone: value as SkinTone })}
            className="flex flex-wrap gap-4"
          >
            {skinToneOptions.map((option) => (
              <Label
                key={option.value}
                htmlFor={`pref-skin-${option.value}`}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`pref-skin-${option.value}`}
                  className="sr-only"
                />
                <div
                  className="w-10 h-10 rounded-full border-2 border-transparent transition-all group-hover:scale-110 group-has-[:checked]:border-primary group-has-[:checked]:ring-2 group-has-[:checked]:ring-primary/20"
                  style={{ backgroundColor: option.color }}
                />
                <span className="text-xs text-muted-foreground group-has-[:checked]:text-primary">
                  {option.label}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Body Type */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Body Type</h2>
          </div>
          <RadioGroup
            value={preferences.bodyType}
            onValueChange={(value) => updatePreferences({ bodyType: value as BodyType })}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {bodyTypeOptions.map((option) => (
              <Label
                key={option.value}
                htmlFor={`pref-body-${option.value}`}
                className="flex items-center gap-3 rounded-lg border-2 border-border p-3 cursor-pointer transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`pref-body-${option.value}`}
                  className="sr-only"
                />
                <span className="text-2xl">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Style Preferences */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Style Preferences</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {styleOptions.map((option) => {
              const isSelected = preferences.stylePreferences.includes(
                option.value as StylePreference
              )
              return (
                <Badge
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => toggleStyle(option.value as StylePreference)}
                >
                  {option.label}
                </Badge>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Shopping For */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Shopping For</h2>
          </div>
          <RadioGroup
            value={preferences.shopFor}
            onValueChange={(value) => updatePreferences({ shopFor: value as ShopFor })}
            className="flex gap-3"
          >
            {shopForOptions.map((option) => (
              <Label
                key={option.value}
                htmlFor={`pref-shop-${option.value}`}
                className="flex items-center gap-2 rounded-lg border-2 border-border px-4 py-2 cursor-pointer transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`pref-shop-${option.value}`}
                  className="sr-only"
                />
                <span className="font-medium">{option.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </div>
    </ScrollArea>
  )
}
