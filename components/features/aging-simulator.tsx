'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Sparkles, X, Loader2, Upload, Video } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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
  const [customImage, setCustomImage] = useState<string | null>(null)
  const displayImage = customImage || imageUrl || ''

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setCustomImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [agedImage, setAgedImage] = useState<string | null>(null)
  const [agingDetails, setAgingDetails] = useState<{
    colorFading: number
    fabricWear: number
    pillingLevel: number
  } | null>(null)

  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const toggleCamera = async () => {
    if (isCameraActive) {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop())
      }
      setIsCameraActive(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsCameraActive(true)
        }
      } catch (err) {
        console.error("Camera error:", err)
        toast.error("Could not access camera")
      }
    }
  }

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const frame = canvas.toDataURL('image/jpeg')
        setCustomImage(frame)
        // Stop camera after capture to save resources
        toggleCamera()
      }
    }
  }

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
        body: JSON.stringify({ image: displayImage, timeframe: optionId, productName })
      });
      
      const data = await response.json();
      
      clearInterval(interval);
      setProgress(100);

      if (response.ok) {
        setAgingDetails({
          colorFading: data.durabilityScore < 60 ? Math.round(data.durabilityScore / 2) : Math.round(data.durabilityScore / 4),
          fabricWear: Math.round((100 - data.durabilityScore) / 2),
          pillingLevel: Math.round((100 - data.durabilityScore) / 1.5),
        })
        setAgedImage(displayImage) // Still use original for visual filter simulation
        toast.success(`6-Month Wear Analysis Complete!`)
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
    const isSixMonths = selectedOption === '6-months';
    const baseFilter = `sepia(${agingDetails.colorFading}%) brightness(${100 - agingDetails.fabricWear / 3}%) contrast(${95 + agingDetails.pillingLevel / 10}%)`;
    // Add subtle blur/grain simulation for older items
    return {
      filter: isSixMonths ? `${baseFilter} saturate(85%)` : baseFilter,
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val && isCameraActive) toggleCamera();
      onOpenChange(val);
    }}>
      <DialogContent className="max-w-2xl bg-slate-950 border-white/10">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-white font-headline">
            <Clock className="h-5 w-5 text-primary" />
            Vivid Aging Simulator v2.0
          </DialogTitle>
          <DialogDescription className="sr-only">
            See how this garment will look after extended use
          </DialogDescription>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-slate-400">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-slate-400">
            Real-time Material Science Engine: Simulating <span className="font-medium text-white">{productName}</span> lifespan.
          </p>

          {/* Aging Options */}
          <div className="flex gap-2">
            {agingOptions.map((option) => (
              <Button
                key={option.id}
                variant={selectedOption === option.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSimulate(option.id)}
                disabled={isProcessing || !displayImage}
                className={cn(
                  "flex-1 rounded-xl transition-all font-headline text-[10px] uppercase tracking-widest",
                  selectedOption === option.id ? "bg-primary shadow-[0_0_15px_rgba(219,144,255,0.4)]" : "border-white/10 hover:bg-white/5"
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Image Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <p className="text-xs font-headline font-bold text-slate-500 uppercase tracking-wider">Live Input</p>
                 <Button variant="ghost" size="sm" onClick={toggleCamera} className="h-7 text-[9px] uppercase tracking-tighter text-secondary">
                    <Video className="h-3 w-3 mr-1" /> {isCameraActive ? 'Cancel' : 'Use Camera'}
                 </Button>
              </div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-slate-900 group">
                <canvas ref={canvasRef} className="hidden" />
                {isCameraActive ? (
                  <div className="absolute inset-0">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale-[0.2]" />
                    <Button 
                      onClick={captureFrame}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 hover:scale-110 transition-transform"
                    >
                      <Sparkles className="h-6 w-6 text-primary" />
                    </Button>
                  </div>
                ) : displayImage ? (
                  <>
                    <Image
                      src={displayImage}
                      alt="Original"
                      fill
                      className="object-cover"
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                       <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                       <span className="text-[10px] font-headline font-bold uppercase tracking-widest">Re-upload</span>
                    </label>
                  </>
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer text-slate-500 hover:text-white">
                    <Upload className="h-8 w-8 mb-2 opacity-30" />
                    <span className="text-[10px] font-headline font-bold uppercase tracking-widest">Garment Vision Scan</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-headline font-bold text-slate-500 uppercase tracking-wider">
                {selectedOption ? agingOptions.find((o) => o.id === selectedOption)?.label : 'Aged Result'}
              </p>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-slate-900 shadow-inner">
                {isProcessing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary">Scanning Matter...</p>
                    <Progress value={progress} className="w-32 h-1 bg-white/10 rounded-full mt-4" />
                  </div>
                ) : agedImage ? (
                  <Image
                    src={agedImage}
                    alt="Aged preview"
                    fill
                    className="object-cover transition-all duration-1000"
                    style={getFilterStyle()}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                    <Clock className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-[10px] font-headline font-bold uppercase tracking-widest">Awaiting Analysis</p>
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
