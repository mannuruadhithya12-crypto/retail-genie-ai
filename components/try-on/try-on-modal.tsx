'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { Product, TryOnResult } from '@/lib/types'
import { mockTryOnResult } from '@/lib/mock-data'

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
  const [mode, setMode] = useState<'standard' | 'overlay' | 'aging'>('standard')
  const [agingYears, setAgingYears] = useState(0)

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setPersonImage(null)
      setBackgroundImage(null)
      setIsGenerating(false)
      setProgress(0)
      setResult(null)
      setZoom(1)
      setMode('standard')
      setAgingYears(0)
    }
  }, [open])

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

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string)
        setMode('overlay')
      }
      reader.readAsDataURL(file)
    }
  }

  const generateTryOn = async () => {
    if (!personImage || !product) return

    setIsGenerating(true)
    setProgress(0)

    // Simulate generation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + Math.random() * 15
      })
    }, 500)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000 + Math.random() * 2000))

    clearInterval(interval)
    setProgress(100)

    // Use mock result
    setResult({
      ...mockTryOnResult,
      personImageUrl: personImage,
      garmentImageUrl: product.imageUrl,
      backgroundUrl: backgroundImage || undefined,
    })
    setIsGenerating(false)
  }

  const handleAging = () => {
    setAgingYears((prev) => (prev === 0 ? 1 : 0))
    toast.info(agingYears === 0 ? 'Showing outfit after 1 year / 10 washes' : 'Showing original condition')
  }

  const handleSave = () => {
    if (result) {
      onSave(result)
      toast.success('Outfit saved!')
    }
  }

  const handleShare = () => {
    toast.info('Sharing feature coming soon!')
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Virtual Try-On
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid lg:grid-cols-2 gap-6 h-full">
            {/* Left: Upload & Preview */}
            <div className="space-y-4">
              <Tabs defaultValue="person" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="person">Your Photo</TabsTrigger>
                  <TabsTrigger value="garment">Garment</TabsTrigger>
                  <TabsTrigger value="result">Result</TabsTrigger>
                </TabsList>

                <TabsContent value="person" className="mt-4">
                  {personImage ? (
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border">
                      <Image
                        src={personImage}
                        alt="Your photo"
                        fill
                        className="object-cover"
                        style={{ transform: `scale(${zoom})` }}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-3 right-3"
                        onClick={() => setPersonImage(null)}
                      >
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                      <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                      <span className="text-sm font-medium">Upload your photo</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Full body photo works best
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePersonImageUpload}
                      />
                    </label>
                  )}
                </TabsContent>

                <TabsContent value="garment" className="mt-4">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-3 left-3 right-3 bg-background/90 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                      <p className="font-medium truncate">{product.name}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="result" className="mt-4">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border border-border bg-muted/20">
                      <Sparkles className="h-12 w-12 text-primary animate-pulse mb-4" />
                      <p className="font-medium mb-2">Generating your try-on...</p>
                      <Progress value={progress} className="w-48 h-2" />
                      <p className="text-sm text-muted-foreground mt-2">
                        {Math.round(progress)}% complete
                      </p>
                    </div>
                  ) : result ? (
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border">
                      <Image
                        src={result.resultImageUrl}
                        alt="Try-on result"
                        fill
                        className="object-cover transition-transform"
                        style={{ 
                          transform: `scale(${zoom})`,
                          filter: agingYears > 0 ? 'sepia(20%) brightness(95%)' : 'none'
                        }}
                      />
                      {agingYears > 0 && (
                        <Badge className="absolute top-3 left-3 bg-warning text-warning-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          After 1 year / 10 washes
                        </Badge>
                      )}
                      <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setZoom(z => Math.min(z + 0.2, 2))}>
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}>
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setZoom(1)}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border border-dashed border-border">
                      <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Upload your photo and click Generate
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Controls */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={generateTryOn}
                  disabled={!personImage || isGenerating}
                  className="flex-1 gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {isGenerating ? 'Generating...' : 'Generate Try-On'}
                </Button>
                <label>
                  <Button variant="outline" size="icon" asChild>
                    <span>
                      <ImageIcon className="h-4 w-4" />
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBackgroundUpload}
                  />
                </label>
                <Button variant="outline" size="icon" onClick={handleAging} disabled={!result}>
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right: AI Commentary & Actions */}
            <div className="space-y-4">
              {result ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Fit Verdict */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-success text-success-foreground">
                          <Check className="h-3 w-3 mr-1" />
                          {result.fitVerdict}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {result.fitReasons.map((reason, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                            <p className="text-sm">{reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Climate Suitability */}
                    <div className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="h-4 w-4 text-warning" />
                        <span className="font-medium">Climate Suitability</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {result.climateSuitability}
                      </p>
                    </div>

                    {/* Sustainability */}
                    {product.sustainabilityScore && (
                      <div className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Leaf className="h-4 w-4 text-success" />
                          <span className="font-medium">Sustainability Impact</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Score</p>
                            <p className="font-semibold text-success">{product.sustainabilityScore}/100</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">CO2 Footprint</p>
                            <p className="font-semibold">{product.co2Estimate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Durability</p>
                            <p className="font-semibold">{product.durabilityWashes} washes</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Special Modes */}
                    <div className="rounded-xl border border-border bg-card p-5">
                      <p className="font-medium mb-3">Special Features</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={mode === 'overlay' ? 'default' : 'outline'}
                          size="sm"
                          className="gap-2"
                          onClick={() => setMode(mode === 'overlay' ? 'standard' : 'overlay')}
                        >
                          <ImageIcon className="h-4 w-4" />
                          Real-Life Overlay
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2" disabled>
                          <Users className="h-4 w-4" />
                          Family/Group
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSave} className="flex-1 gap-2">
                        <Heart className="h-4 w-4" />
                        Save Outfit
                      </Button>
                      <Button variant="outline" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Retailer Links */}
                    <div className="rounded-xl border border-border bg-card p-5">
                      <p className="font-medium mb-3">Buy Now</p>
                      <div className="space-y-2">
                        {product.retailers.slice(0, 3).map((retailer, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                          >
                            <div>
                              <p className="font-medium">{retailer.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {retailer.inStock ? 'In Stock' : 'Out of Stock'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${retailer.price}</p>
                              <Button size="sm" variant="link" className="h-auto p-0" disabled={!retailer.inStock}>
                                Shop
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="space-y-4">
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
