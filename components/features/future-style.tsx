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

interface FutureStyleProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddToChat: (products: Product[]) => void
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
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + Math.random() * 12
      })
    }, 300)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    clearInterval(interval)
    setProgress(100)

    setEvolution({
      current: 'Casual Contemporary',
      predicted: 'Minimalist Luxury',
      confidence: 87,
      timeline: '6-12 months',
      influences: [
        'Increasing preference for neutral tones',
        'Growing interest in quality over quantity',
        'Shift toward sustainable brands',
        'Preference for timeless silhouettes',
      ],
    })

    setFutureProof([
      {
        product: mockProducts[0],
        reason: 'Versatile neutral that bridges casual and formal',
        longevity: 95,
      },
      {
        product: mockProducts[1],
        reason: 'Classic silhouette with modern minimalist appeal',
        longevity: 88,
      },
      {
        product: mockProducts[2],
        reason: 'Investment piece that aligns with your evolving taste',
        longevity: 92,
      },
    ])

    setIsAnalyzing(false)
  }

  const handleAddAll = () => {
    onAddToChat(futureProof.map((item) => item.product))
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
