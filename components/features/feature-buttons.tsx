'use client'

import { Smile, CalendarDays, Globe, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface FeatureButtonsProps {
  onMoodClick: () => void
  onCalendarClick: () => void
  onCulturalClick: () => void
  onSustainabilityClick: () => void
}

export function FeatureButtons({
  onMoodClick,
  onCalendarClick,
  onCulturalClick,
  onSustainabilityClick,
}: FeatureButtonsProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-2 bg-secondary/50 rounded-xl backdrop-blur-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoodClick}
              className="gap-1.5 text-xs"
            >
              <Smile className="h-4 w-4" />
              <span className="hidden sm:inline">Mood</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mood-to-Outfit Translator</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCalendarClick}
              className="gap-1.5 text-xs"
            >
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Calendar Agent - Plan outfits for events</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCulturalClick}
              className="gap-1.5 text-xs"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Fusion</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Cultural Fusion Creator</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSustainabilityClick}
              className="gap-1.5 text-xs"
            >
              <Leaf className="h-4 w-4" />
              <span className="hidden sm:inline">Eco</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sustainability Focus</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
