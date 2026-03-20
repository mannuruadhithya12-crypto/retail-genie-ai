'use client'

import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { climateOptions } from '@/lib/mock-data'

export function LocationStep() {
  const { preferences, updatePreferences } = useAppStore()

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <MapPin className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Where are you located?</h2>
        <p className="text-muted-foreground">
          This helps us suggest climate-appropriate clothing
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="location">City or Region</Label>
          <Input
            id="location"
            placeholder="e.g., New York, London, Tokyo..."
            value={preferences.location}
            onChange={(e) => updatePreferences({ location: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="climate">Climate Type</Label>
          <Select
            value={preferences.climate}
            onValueChange={(value) => updatePreferences({ climate: value })}
          >
            <SelectTrigger id="climate" className="h-12">
              <SelectValue placeholder="Select your climate" />
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
  )
}
