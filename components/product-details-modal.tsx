'use client'

import Image from 'next/image'
import { X, Sparkles, Heart, ExternalLink, Leaf, Droplets, Star, ThumbsUp, Clock, MessageCircle } from 'lucide-react'
import { SocialEchoStats } from './features/social-echo'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onTryOn: (product: Product) => void
  onSave: (product: Product) => void
}

const verdictConfig = {
  'strong-buy': {
    label: 'Strong Buy',
    className: 'bg-success text-success-foreground',
  },
  'consider': {
    label: 'Consider',
    className: 'bg-warning text-warning-foreground',
  },
  'skip': {
    label: 'Skip',
    className: 'bg-destructive text-destructive-foreground',
  },
}

import { useEffect, useState } from 'react'

export function ProductDetailsModal({
  open,
  onOpenChange,
  product: initialProduct,
  onTryOn,
  onSave,
}: ProductDetailsModalProps) {
  const [product, setProduct] = useState<Product | null>(initialProduct)
  const [isSustainabilityLoading, setIsSustainabilityLoading] = useState(false)

  useEffect(() => {
    setProduct(initialProduct)
  }, [initialProduct])

  useEffect(() => {
    if (open && product && !product.sustainabilityScore) {
      const fetchSustainability = async () => {
        setIsSustainabilityLoading(true)
        try {
          const response = await fetch(`/api/ai/sustainability/${product.id}`)
          const data = await response.json()
          if (response.ok) {
            setProduct(prev => prev ? {
              ...prev,
              sustainabilityScore: data.ecoScore,
              co2Estimate: data.co2Estimate,
              durabilityWashes: data.durabilityWashes
            } : null)
          }
        } catch (error) {
          console.error('Sustainability AI Error:', error)
        } finally {
          setIsSustainabilityLoading(false)
        }
      }
      fetchSustainability()
    }
  }, [open, product?.id])

  if (!product) return null

  const verdict = verdictConfig[product.verdict]
  const currencySymbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥',
    CNY: '¥', AUD: 'A$', CAD: 'C$', BRL: 'R$', KRW: '₩',
  }
  const symbol = currencySymbols[product.currency] || '$'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto p-0">
        <DialogHeader className="sticky top-0 z-10 bg-background px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Product details, pricing, and sustainability information
            </DialogDescription>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-border">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
              <Badge className={cn('absolute top-3 right-3', verdict.className)}>
                {verdict.label}
              </Badge>
            </div>

            {/* Details */}
            <div className="space-y-5">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                  {product.brand}
                </p>
                <h2 className="text-2xl font-semibold">{product.name}</h2>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  {symbol}{product.priceMin}
                </span>
                {product.priceMax > product.priceMin && (
                  <span className="text-lg text-muted-foreground">
                    - {symbol}{product.priceMax}
                  </span>
                )}
              </div>

              {/* Verdict Reasons */}
              <div className="space-y-2">
                <p className="font-medium">Why this recommendation:</p>
                <ul className="space-y-1.5">
                  {product.verdictReasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <ThumbsUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Sustainability */}
              {product.sustainabilityScore && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-success" />
                    <span className="font-medium">Sustainability</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-secondary/50 p-3 text-center">
                      <p className="text-2xl font-bold text-success">
                        {product.sustainabilityScore}
                      </p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3 text-center">
                      <p className="text-lg font-semibold">{product.co2Estimate}</p>
                      <p className="text-xs text-muted-foreground">CO2</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Droplets className="h-4 w-4" />
                        <span className="text-lg font-semibold">{product.durabilityWashes}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Washes</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Echo */}
              <SocialEchoStats product={product} />

              {/* Review Sentiment */}
              {product.reviewSentiment && (
                <div className="rounded-lg bg-secondary/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-warning fill-warning" />
                    <span className="font-medium">Customer Reviews</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {product.reviewSentiment}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 gap-2" onClick={() => onTryOn(product)}>
                  <Sparkles className="h-4 w-4" />
                  Try On
                </Button>
                <Button variant="outline" onClick={() => onSave(product)}>
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Price Comparison */}
              <div className="space-y-3">
                <p className="font-medium">Price Comparison</p>
                <div className="space-y-2">
                  {product.retailers.map((retailer, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border',
                        index === 0 ? 'border-primary bg-primary/5' : 'border-border'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">Best Price</Badge>
                        )}
                        <span className="font-medium">{retailer.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{symbol}{retailer.price}</span>
                        <Button
                          size="sm"
                          variant={retailer.inStock ? 'default' : 'outline'}
                          disabled={!retailer.inStock}
                          className="gap-1"
                        >
                          {retailer.inStock ? 'Shop' : 'Out of Stock'}
                          {retailer.inStock && <ExternalLink className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
