'use client'

import { useState } from 'react'
import { Globe, X, Sparkles, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

const cultureSuggestions = [
  'Japanese',
  'Korean',
  'Indian',
  'African',
  'Scandinavian',
  'Mediterranean',
  'Latin American',
  'Middle Eastern',
  'Western',
  'Chinese',
  'Southeast Asian',
  'European',
]

interface CulturalFusionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (cultures: string[]) => void
}

export function CulturalFusion({ open, onOpenChange, onGenerate }: CulturalFusionProps) {
  const [selectedCultures, setSelectedCultures] = useState<string[]>([])
  const [customCulture, setCustomCulture] = useState('')

  const toggleCulture = (culture: string) => {
    setSelectedCultures((prev) =>
      prev.includes(culture)
        ? prev.filter((c) => c !== culture)
        : prev.length < 4
        ? [...prev, culture]
        : prev
    )
  }

  const addCustomCulture = () => {
    if (customCulture.trim() && selectedCultures.length < 4) {
      if (!selectedCultures.includes(customCulture.trim())) {
        setSelectedCultures([...selectedCultures, customCulture.trim()])
      }
      setCustomCulture('')
    }
  }

  const handleGenerate = () => {
    onGenerate(selectedCultures)
    onOpenChange(false)
    setSelectedCultures([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Cultural Fusion Creator
            </DialogTitle>
            <DialogDescription className="sr-only">
              Mix fashion elements from different cultures to create unique outfits
            </DialogDescription>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div>
            <p className="text-muted-foreground mb-4">
              Mix fashion elements from different cultures to create unique hybrid outfit concepts. Select up to 4 cultural influences.
            </p>

            {/* Selected cultures */}
            {selectedCultures.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCultures.map((culture) => (
                  <Badge
                    key={culture}
                    variant="default"
                    className="gap-1 cursor-pointer"
                    onClick={() => toggleCulture(culture)}
                  >
                    {culture}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Culture suggestions */}
          <div className="space-y-2">
            <Label>Cultural Influences</Label>
            <div className="flex flex-wrap gap-2">
              {cultureSuggestions.map((culture) => {
                const isSelected = selectedCultures.includes(culture)
                return (
                  <Badge
                    key={culture}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => toggleCulture(culture)}
                  >
                    {culture}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Custom input */}
          <div className="space-y-2">
            <Label htmlFor="custom-culture">Add Custom Culture</Label>
            <div className="flex gap-2">
              <Input
                id="custom-culture"
                placeholder="e.g., Bohemian, Victorian..."
                value={customCulture}
                onChange={(e) => setCustomCulture(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomCulture()}
                disabled={selectedCultures.length >= 4}
              />
              <Button
                size="icon"
                variant="outline"
                onClick={addCustomCulture}
                disabled={!customCulture.trim() || selectedCultures.length >= 4}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedCultures.length}/4 cultures selected
            </p>
          </div>

          {/* Preview description */}
          {selectedCultures.length >= 2 && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm">
                <span className="font-medium text-primary">Fusion concept: </span>
                Combining {selectedCultures.slice(0, -1).join(', ')}
                {selectedCultures.length > 1 && ` and ${selectedCultures[selectedCultures.length - 1]}`} fashion elements
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2"
            disabled={selectedCultures.length < 2}
            onClick={handleGenerate}
          >
            <Sparkles className="h-4 w-4" />
            Create Fusion Outfits
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
