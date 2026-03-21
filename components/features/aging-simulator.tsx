'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Sparkles, X, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface AgingSimulatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  productName: string
}

const agingOptions = [
  { id: '10-washes', label: 'After 10 Washes', months: 2 },
  { id: '6-months', label: 'After 6 Months', months: 6 },
  { id: '1-year', label: 'After 1 Year', months: 12 },
]

export function AgingSimulator({ open, onOpenChange, imageUrl, productName }: AgingSimulatorProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [agedImage, setAgedImage] = useState<string | null>(null)
  const [agingDetails, setAgingDetails] = useState<{
    colorFading: number
    fabricWear: number
    pillingLevel: number
  } | null>(null)

  const handleSimulate = async (optionId: string) => {
    setSelectedOption(optionId)
    setIsProcessing(true)
    setProgress(0)
    setAgedImage(null)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 10;
      })
    }, 200)

    try {
      const response = await fetch('/api/ai/outfit-aging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl, timeframe: optionId, productName })
      });
      
      const data = await response.json();
      
      clearInterval(interval);
      setProgress(100);

      if (response.ok) {
        setAgingDetails({
          colorFading: Math.round(data.durabilityScore / 3),
          fabricWear: Math.round((100 - data.durabilityScore) / 2),
          pillingLevel: Math.round((100 - data.durabilityScore) / 1.5),
        })
        setAgedImage(imageUrl) // Still use original for visual filter simulation
        toast.success('Simulation complete!')
      }
    } catch (error) {
      console.error('Aging AI Error:', error);
      toast.error('Simulation failed.');
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setSelectedOption(null)
    setAgedImage(null)
    setAgingDetails(null)
    setProgress(0)
  }

  const getFilterStyle = () => {
    if (!agingDetails) return {}
    return {
      filter: `sepia(${agingDetails.colorFading}%) brightness(${100 - agingDetails.fabricWear / 3}%) contrast(${95 + agingDetails.pillingLevel / 10}%)`,
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Outfit Aging Simulator
          </DialogTitle>
          <DialogDescription className="sr-only">
            See how this garment will look after extended use
          </DialogDescription>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            See how <span className="font-medium text-foreground">{productName}</span> will look after long-term usage
          </p>

          {/* Aging Options */}
          <div className="flex gap-2">
            {agingOptions.map((option) => (
              <Button
                key={option.id}
                variant={selectedOption === option.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSimulate(option.id)}
                disabled={isProcessing}
                className="flex-1"
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Image Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Original</p>
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border">
                <Image
                  src={imageUrl}
                  alt="Original"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {selectedOption ? agingOptions.find((o) => o.id === selectedOption)?.label : 'Aged Preview'}
              </p>
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-muted/20">
                {isProcessing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                    <p className="text-sm font-medium">Simulating wear...</p>
                    <Progress value={progress} className="w-32 h-1.5 mt-2" />
                  </div>
                ) : agedImage ? (
                  <Image
                    src={agedImage}
                    alt="Aged preview"
                    fill
                    className="object-cover transition-all duration-500"
                    style={getFilterStyle()}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <Clock className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">Select an aging option</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Aging Details */}
          <AnimatePresence>
            {agingDetails && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl border border-border bg-card p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">Wear Analysis</p>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    Reset
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Color Fading</span>
                      <Badge variant="secondary">{agingDetails.colorFading}%</Badge>
                    </div>
                    <Progress value={agingDetails.colorFading} className="h-1.5" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Fabric Wear</span>
                      <Badge variant="secondary">{agingDetails.fabricWear}%</Badge>
                    </div>
                    <Progress value={agingDetails.fabricWear} className="h-1.5" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pilling Level</span>
                      <Badge variant="secondary">{agingDetails.pillingLevel}%</Badge>
                    </div>
                    <Progress value={agingDetails.pillingLevel} className="h-1.5" />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {agingDetails.colorFading < 20
                    ? 'This garment maintains excellent color retention over time.'
                    : agingDetails.colorFading < 35
                    ? 'Moderate color fading expected. Consider washing inside-out.'
                    : 'Significant color change expected. Best for casual wear after aging.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
