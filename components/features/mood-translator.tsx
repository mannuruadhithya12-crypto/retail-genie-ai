'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { moodOptions } from '@/lib/mock-data'
import type { Mood } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MoodTranslatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectMood: (mood: Mood) => void
}

const moodColors: Record<Mood, string> = {
  confident: 'from-amber-500 to-orange-600',
  cozy: 'from-orange-400 to-amber-500',
  adventurous: 'from-emerald-500 to-teal-600',
  romantic: 'from-pink-500 to-rose-600',
  professional: 'from-slate-500 to-zinc-600',
  playful: 'from-violet-500 to-purple-600',
  mysterious: 'from-indigo-600 to-slate-800',
  relaxed: 'from-sky-400 to-blue-500',
}

export function MoodTranslator({ open, onOpenChange, onSelectMood }: MoodTranslatorProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)

  const handleSelect = (mood: Mood) => {
    setSelectedMood(mood)
  }

  const handleConfirm = () => {
    if (selectedMood) {
      onSelectMood(selectedMood)
      onOpenChange(false)
      setSelectedMood(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              How are you feeling today?
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-muted-foreground mb-6">
            Select your mood and I will suggest outfits that match your energy
          </p>

          <div className="grid grid-cols-2 gap-3">
            {moodOptions.map((mood) => (
              <motion.button
                key={mood.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(mood.value as Mood)}
                className={cn(
                  'relative overflow-hidden rounded-xl p-4 text-left transition-all',
                  'border-2',
                  selectedMood === mood.value
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div
                  className={cn(
                    'absolute inset-0 opacity-10 bg-gradient-to-br',
                    moodColors[mood.value as Mood]
                  )}
                />
                <div className="relative">
                  <p className="font-semibold">{mood.label}</p>
                  <p className="text-sm text-muted-foreground">{mood.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
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
            className="flex-1"
            disabled={!selectedMood}
            onClick={handleConfirm}
          >
            Get Outfit Suggestions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
