'use client'

import { useState } from 'react'
import { CalendarDays, Plus, X, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CalendarEvent {
  id: string
  date: Date
  title: string
}

interface CalendarAgentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerateOutfits: (events: CalendarEvent[]) => void
}

export function CalendarAgent({ open, onOpenChange, onGenerateOutfits }: CalendarAgentProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [eventTitle, setEventTitle] = useState('')

  const addEvent = () => {
    if (!selectedDate || !eventTitle.trim()) return

    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      date: selectedDate,
      title: eventTitle.trim(),
    }

    setEvents([...events, newEvent])
    setEventTitle('')
  }

  const removeEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id))
  }

  const handleGenerate = () => {
    onGenerateOutfits(events)
    onOpenChange(false)
    setEvents([])
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Calendar Agent
            </DialogTitle>
            <DialogDescription className="sr-only">
              Add upcoming events to get personalized outfit suggestions
            </DialogDescription>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Calendar */}
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-lg border border-border"
              disabled={(date) => date < new Date()}
            />

            <div className="space-y-2">
              <Label htmlFor="event-title">Event Name</Label>
              <div className="flex gap-2">
                <Input
                  id="event-title"
                  placeholder="e.g., Job Interview, Wedding, Date Night..."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addEvent()}
                />
                <Button size="icon" onClick={addEvent} disabled={!eventTitle.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Upcoming Events</Label>
              <Badge variant="secondary">{events.length} events</Badge>
            </div>

            <ScrollArea className="h-[280px] rounded-lg border border-border p-3">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <CalendarDays className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Add events to get personalized outfit suggestions for each occasion
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {events
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      >
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(event.date)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEvent(event.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </ScrollArea>
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
            className="flex-1 gap-2"
            disabled={events.length === 0}
            onClick={handleGenerate}
          >
            <Sparkles className="h-4 w-4" />
            Generate Outfits for {events.length} Event{events.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
