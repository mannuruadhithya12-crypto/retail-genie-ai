'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Download,
  Share2,
  Heart,
  Clock,
  Users,
  ImageIcon,
  Sparkles,
  Check,
  Leaf,
  Camera
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { Product, TryOnResult } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { ARMirror } from '@/components/ar/ARMirror'

interface TryOnModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSave: (result: TryOnResult) => void
}

export function TryOnModal({ open, onOpenChange, product, onSave }: TryOnModalProps) {
  const [personImage, setPersonImage] = useState<string | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<TryOnResult | null>(null)
  const [zoom, setZoom] = useState(1)
  const [mode, setMode] = useState<'standard' | 'overlay' | 'aging' | 'ar'>('standard')
  const [agingYears, setAgingYears] = useState(0)
  const { preferences } = useAppStore()

  useEffect(() => {
    if (!open) {
      setPersonImage(null);
      setBackgroundImage(null);
      setIsGenerating(false);
      setProgress(0);
      setResult(null);
      setZoom(1);
      setMode('standard');
      setAgingYears(0);
    }
  }, [open]);

  const handlePersonImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPersonImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateTryOn = async () => {
    if (!personImage || !product) return
    setIsGenerating(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 10
      })
    }, 400)

    try {
      const response = await fetch('/api/ai/virtual-try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, preferences })
      });
      const data = await response.json();
      
      if (data.success) {
        setResult({
          id: crypto.randomUUID(),
          personImageUrl: personImage,
          garmentImageUrl: product.imageUrl,
          resultImageUrl: personImage,
          fitScore: data.fitScore || 85,
          styleAnalysis: data.styleAnalysis || "Looks great!",
          recommendations: data.recommendations || []
        })
      }
    } catch (error) {
      console.error("Virtual Try-On error:", error);
    }

    clearInterval(interval)
    setProgress(100)
    setIsGenerating(false)
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Virtual Fitting Mirror
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid lg:grid-cols-2 gap-6 h-full">
            <div className="space-y-4">
              <Tabs value={mode === 'ar' ? 'ar' : 'standard'} onValueChange={(val) => setMode(val as any)} className="w-full h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="standard">Photo Upload</TabsTrigger>
                  <TabsTrigger value="ar">AR Mirror</TabsTrigger>
                </TabsList>

                <TabsContent value="standard" className="mt-4">
                  {personImage ? (
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border">
                      <Image src={personImage} alt="Your photo" fill className="object-cover" />
                      <Button variant="secondary" size="sm" className="absolute bottom-3 right-3" onClick={() => setPersonImage(null)}>Change</Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border-2 border-dashed border-border cursor-pointer">
                      <Upload className="h-10 w-10 mb-3" />
                      <span className="text-sm">Upload Photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePersonImageUpload} />
                    </label>
                  )}
                </TabsContent>

                <TabsContent value="ar" className="mt-4 flex-1 min-h-[500px]">
                  {mode === 'ar' && (
                    <div className="w-full h-[500px] border-2 border-primary rounded-xl overflow-hidden shadow-2xl">
                      <ARMirror 
                        selectedGarments={[
                          {
                            id: product.id,
                            type: 'outer',
                            attachmentType: 'upper_body',
                            modelUrl: '', 
                            imageUrl: product.imageUrl,
                            scale: [1, 1, 1],
                            positionOffset: [0, 0, 0]
                          }
                        ]} 
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button onClick={generateTryOn} disabled={!personImage || isGenerating || mode === 'ar'} className="flex-1 gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Results
                </Button>
                <Button variant="outline" onClick={() => setMode(mode === 'ar' ? 'standard' : 'ar')}>
                  <Camera className="h-4 w-4 mr-2" />
                  {mode === 'ar' ? "Stop Mirror" : "Live Mirror"}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden">
                  {isGenerating && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-muted">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Style Analysis
                  </h3>
                  {result ? (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-4 border-primary flex items-center justify-center">
                          <span className="font-bold text-lg text-primary">{result.fitScore}%</span>
                        </div>
                        <p className="font-semibold">AI Fit Match</p>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{result.styleAnalysis}</p>
                      {result.recommendations && result.recommendations.length > 0 && (
                        <div className="pt-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Styling Tips</h4>
                          <ul className="space-y-2">
                            {result.recommendations.map((rec: string, i: number) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <Check className="h-4 w-4 text-primary shrink-0" /> {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isGenerating 
                        ? "Our AI is currently analyzing your attributes and garment features... (This may take a moment)" 
                        : "Upload a photo and click Generate Results for expert reasoning based on your personal attributes and the garment's design."}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => { onSave(result as any); onOpenChange(false); }} disabled={!result}>Save Look</Button>
                </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
