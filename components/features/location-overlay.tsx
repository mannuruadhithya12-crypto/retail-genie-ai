'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Upload, X, Loader2, Sparkles, Download, Share2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface LocationOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personImageUrl?: string
  garmentImageUrl?: string
}

const presetBackgrounds = [
  { id: 'office', label: 'Office', url: '/backgrounds/office.jpg' },
  { id: 'street', label: 'Street', url: '/backgrounds/street.jpg' },
  { id: 'beach', label: 'Beach', url: '/backgrounds/beach.jpg' },
  { id: 'restaurant', label: 'Restaurant', url: '/backgrounds/restaurant.jpg' },
]

export function LocationOverlay({ open, onOpenChange, personImageUrl, garmentImageUrl }: LocationOverlayProps) {
  const [personImage, setPersonImage] = useState<string | null>(personImageUrl || null)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [resultData, setResultData] = useState<any>(null)

  const handlePersonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setPersonImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setBackgroundImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!personImage || !backgroundImage) {
      toast.error('Please upload both a person photo and background')
      return
    }

    setIsProcessing(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 5;
      })
    }, 300)

    try {
      const response = await fetch('/api/ai/location-overlay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outfitImage: personImage, backgroundImage })
      });
      
      const data = await response.json();
      
      clearInterval(interval);
      setProgress(100);

      if (response.ok) {
        setResultImage(data.compositedImageUrl);
        setResultData(data);
        toast.success(`Overlay Match Score: ${data.lightingMatchScore}%`);
      }
    } catch (error) {
      console.error('Location AI Error:', error);
      toast.error('Overlay generation failed.');
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setPersonImage(null)
    setBackgroundImage(null)
    setResultImage(null)
    setProgress(0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Real-Life Location Overlay
          </DialogTitle>
          <DialogDescription className="sr-only">
            See how your outfit looks in different real-world environments
          </DialogDescription>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            See how your outfit looks in different real-world environments
          </p>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Photos</TabsTrigger>
              <TabsTrigger value="result" disabled={!resultImage}>Result</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Person Upload */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Your Try-On Photo</p>
                  {personImage ? (
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border">
                      <Image src={personImage} alt="Person" fill className="object-cover" />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-2 right-2"
                        onClick={() => setPersonImage(null)}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">Upload person photo</span>
                      <span className="text-xs text-muted-foreground mt-1">Or use your try-on result</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePersonUpload} />
                    </label>
                  )}
                </div>

                {/* Background Upload */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Background Location</p>
                  {backgroundImage ? (
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border">
                      <Image src={backgroundImage} alt="Background" fill className="object-cover" />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-2 right-2"
                        onClick={() => setBackgroundImage(null)}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                      <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">Upload background</span>
                      <span className="text-xs text-muted-foreground mt-1">Office, street, beach, etc.</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* Preset Backgrounds */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Or choose a preset</p>
                <div className="grid grid-cols-4 gap-2">
                  {presetBackgrounds.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setBackgroundImage(`https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=600&fit=crop`)}
                      className="relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end justify-center pb-2">
                        <span className="text-xs font-medium">{bg.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={!personImage || !backgroundImage || isProcessing}
                  className="flex-1 gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Overlay
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    {Math.round(progress)}% - Compositing images...
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="result" className="mt-4">
              <AnimatePresence>
                {resultImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="relative aspect-[3/4] max-w-md mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
                      {backgroundImage && (
                        <Image src={backgroundImage} alt="Background" fill className="object-cover opacity-60" />
                      )}
                      
                      <Image 
                        src={resultImage} 
                        alt="Composited Result" 
                        fill 
                        className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] scale-90 transition-transform duration-700"
                      />

                      {/* AI Floating Badges */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between gap-2">
                        <Badge className="bg-primary/90 text-[10px] font-headline tracking-tighter mix-blend-overlay">
                          LIGHTING MATCH: {resultData?.lightingMatchScore}%
                        </Badge>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
                         <p className="text-[10px] font-headline uppercase tracking-widest text-primary mb-1">Vibe Check</p>
                         <p className="text-sm font-medium text-white leading-tight italic">"{resultData?.vibeCheck || 'Looking sharp!'}"</p>
                      </div>
                    </div>

                    {/* Pro Tips */}
                    {resultData?.adjustments && resultData.adjustments.length > 0 && (
                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <p className="text-[10px] font-headline uppercase tracking-widest text-primary mb-2">Pro Lighting Adjustments</p>
                        <div className="flex flex-wrap gap-2">
                          {resultData.adjustments.map((adj: string) => (
                            <Badge key={adj} variant="outline" className="text-[10px] border-primary/20 bg-primary/5">
                              {adj}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center gap-2">
                      <Button variant="outline" className="flex-1 gap-2 rounded-xl">
                        <Download className="h-4 w-4" />
                        Save Image
                      </Button>
                      <Button variant="outline" className="flex-1 gap-2 rounded-xl">
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
