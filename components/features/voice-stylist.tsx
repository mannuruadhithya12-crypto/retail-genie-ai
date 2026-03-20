'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, Loader2, X, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface VoiceStylistProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTranscript: (text: string) => void
}

export function VoiceStylist({ open, onOpenChange, onTranscript }: VoiceStylistProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    setIsRecording(true)
    setRecordingTime(0)
    setTranscript(null)

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    // Mock recording - in production, use Web Speech API or similar
    toast.info('Listening... Speak your style request')
  }

  const stopRecording = async () => {
    setIsRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setIsProcessing(true)

    // Simulate transcription
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockTranscripts = [
      "I need something casual for a coffee date this weekend",
      "Show me professional outfits for my new job interview",
      "I want to look effortlessly chic for a gallery opening",
      "Find me comfortable travel clothes for my trip to Tokyo",
    ]

    const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)]
    setTranscript(randomTranscript)
    setIsProcessing(false)
  }

  const handlePlayResponse = () => {
    setIsPlaying(true)
    toast.info('Voice response feature coming soon!')
    setTimeout(() => setIsPlaying(false), 2000)
  }

  const handleSubmit = () => {
    if (transcript) {
      onTranscript(transcript)
      onOpenChange(false)
      setTranscript(null)
      setRecordingTime(0)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Voice Personal Stylist
          </DialogTitle>
          <DialogDescription className="sr-only">
            Speak your style request and get personalized recommendations
          </DialogDescription>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Speak your style request and let AI find the perfect outfit
          </p>

          {/* Recording Button */}
          <div className="flex flex-col items-center gap-4">
            <motion.button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
                isRecording
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
              
              {isRecording && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-destructive"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </motion.button>

            <p className="text-sm font-medium">
              {isProcessing
                ? 'Processing...'
                : isRecording
                ? formatTime(recordingTime)
                : 'Tap to speak'}
            </p>

            {isRecording && (
              <div className="w-full max-w-[200px]">
                <motion.div
                  className="h-1 bg-primary rounded-full"
                  animate={{ scaleX: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              </div>
            )}
          </div>

          {/* Transcript */}
          <AnimatePresence>
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl border border-border bg-card">
                  <p className="text-xs text-muted-foreground mb-2">You said:</p>
                  <p className="text-sm font-medium">"{transcript}"</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSubmit} className="flex-1 gap-2">
                    <Sparkles className="h-4 w-4" />
                    Find Outfits
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePlayResponse}
                    disabled={isPlaying}
                  >
                    {isPlaying ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips */}
          <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
            <p className="text-xs font-medium">Try saying:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>"I need something elegant for a dinner party"</li>
              <li>"Show me casual summer outfits"</li>
              <li>"Find me a professional look for interviews"</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
