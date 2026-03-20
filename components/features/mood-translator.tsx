'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
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
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSelect = (mood: Mood) => {
    setSelectedMood(mood)
  }

  const handleConfirm = async () => {
    if (!selectedMood) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/mood-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: selectedMood, preferences: {} }),
      })
      const data = await response.json()
      if (data.success) {
        setResult(data)
        onSelectMood(selectedMood)
      }
    } catch (error) {
      console.error('Mood translation error:', error)
    } finally {
      setIsLoading(false)
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
            <DialogDescription className="sr-only">
              Select your mood to get personalized outfit suggestions
            </DialogDescription>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-muted-foreground mb-6">
            Select your mood and I will suggest outfits that match your energy
          </p>

          {!result ? (
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
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm italic">"{result.advice}"</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {result.pieces?.map((piece: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-card border border-border">
                    <p className="font-medium text-sm text-primary">{piece.name}</p>
                    <p className="text-xs text-muted-foreground">{piece.reason}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => setResult(null)} className="w-full">
                Try another mood
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!result && (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedMood || isLoading}
                onClick={handleConfirm}
              >
                {isLoading ? 'Translating Mood...' : 'Get Outfit Suggestions'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
