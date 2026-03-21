'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, TrendingUp, Loader2, ShoppingBag, Lightbulb } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { mockProducts } from '@/lib/mock-data'
import type { Product } from '@/lib/types'

import { useAppStore } from '@/lib/store'

interface FutureStyleProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddToChat: (products: Product[], evolutionData?: any) => void
}

interface StyleEvolution {
  current: string
  predicted: string
  confidence: number
  timeline: string
  influences: string[]
}

interface FutureProofItem {
  product: Product
  reason: string
  longevity: number
}

export function FutureStyle({ open, onOpenChange, onAddToChat }: FutureStyleProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [evolution, setEvolution] = useState<StyleEvolution | null>(null)
  const [futureProof, setFutureProof] = useState<FutureProofItem[]>([])
  const { preferences } = useAppStore()

  useEffect(() => {
    if (open && !evolution) {
      analyzeStyle()
    }
  }, [open])

  const analyzeStyle = async () => {
    setIsAnalyzing(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 10
      })
    }, 400)

    try {
      const response = await fetch('/api/ai/style-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recentOutfits: [], recentHistory: [], preferences })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEvolution({
          current: data.currentStyle,
          predicted: data.predictedStyle,
          confidence: data.confidence || 85,
          timeline: data.timeline || '6-12 months',
          influences: data.influences || [],
        });

        const formattedPieces = (data.investmentPieces || []).map((p: any) => {
          const sp = p.scrapedProduct;
          return {
            product: {
              id: crypto.randomUUID(),
              name: sp ? sp.name : p.name,
              brand: sp ? sp.brand : 'Future Investment',
              imageUrl: sp ? sp.imageUrl : 'https://images.unsplash.com/photo-1591047139829-d91aec36beea?auto=format&fit=crop&q=80&w=400',
              priceMin: sp ? sp.price : 150,
              priceMax: sp ? (sp.priceMax || sp.price) : 500,
              currency: sp ? sp.currency : 'USD',
              productUrl: sp ? sp.productUrl : '#',
              verdict: 'strong-buy',
              verdictReasons: [p.reason || 'Future proof'],
              retailers: []
            },
            reason: p.reason,
            longevity: p.longevity || 90
          }
        });
        
        setFutureProof(formattedPieces);
      }
    } catch (error) {
      console.error('Future Prediction Error:', error);
    }

    clearInterval(interval)
    setProgress(100)
    setIsAnalyzing(false)
  }

  const handleAddAll = () => {
    onAddToChat(futureProof.map((item) => item.product), evolution)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Future Style Predictor
          </DialogTitle>
          <DialogDescription className="sr-only">
            AI analysis of your style evolution and future-proof purchases
          </DialogDescription>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="font-medium mb-2">Analyzing your style evolution...</p>
              <Progress value={progress} className="w-48 h-2" />
              <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}%</p>
            </div>
          ) : (
            <AnimatePresence>
              {evolution && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Style Evolution Card */}
                  <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Your Style Evolution</h3>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 text-center p-4 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground mb-1">Current</p>
                          <p className="font-semibold">{evolution.current}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-px w-8 bg-primary" />
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <div className="h-px w-8 bg-primary" />
                        </div>
                        <div className="flex-1 text-center p-4 rounded-lg bg-primary/20">
                          <p className="text-xs text-muted-foreground mb-1">Predicted</p>
                          <p className="font-semibold text-primary">{evolution.predicted}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Timeline: <span className="text-foreground">{evolution.timeline}</span>
                        </span>
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          {evolution.confidence}% confidence
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Influences */}
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-warning" />
                      Key Influences
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {evolution.influences.map((influence, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30"
                        >
                          <span className="text-xs font-medium text-primary">{index + 1}.</span>
                          <p className="text-sm">{influence}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Future-Proof Purchases */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        Future-Proof Purchases
                      </h3>
                      <Button size="sm" onClick={handleAddAll}>
                        Add All to Chat
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      {futureProof.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex gap-4 p-4 rounded-xl border border-border bg-card"
                        >
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                                <p className="font-medium truncate">{item.product.name}</p>
                              </div>
                              <Badge variant="secondary" className="shrink-0">
                                {item.longevity}% longevity
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={analyzeStyle}
                  >
                    Refresh Analysis
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
