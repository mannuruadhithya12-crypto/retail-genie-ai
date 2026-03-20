'use client'

import Image from 'next/image'
import { Eye, Heart, Sparkles, Leaf, Droplets } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  onTryOn: (product: Product) => void
  onSave: (product: Product) => void
  onDetails: (product: Product) => void
}

const verdictConfig = {
  'strong-buy': {
    label: 'Strong Buy',
    className: 'bg-success text-success-foreground',
    icon: Sparkles,
  },
  'consider': {
    label: 'Consider',
    className: 'bg-warning text-warning-foreground',
    icon: Eye,
  },
  'skip': {
    label: 'Skip',
    className: 'bg-destructive text-destructive-foreground',
    icon: null,
  },
}

export function ProductCard({ product, onTryOn, onSave, onDetails }: ProductCardProps) {
  const verdict = verdictConfig[product.verdict]
  const currencySymbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥',
    CNY: '¥', AUD: 'A$', CAD: 'C$', BRL: 'R$', KRW: '₩',
  }
  const symbol = currencySymbols[product.currency] || '$'

  return (
    <Card className="group overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        {/* Verdict Badge */}
        <Badge className={cn('absolute top-3 right-3', verdict.className)}>
          {verdict.icon && <verdict.icon className="h-3 w-3 mr-1" />}
          {verdict.label}
        </Badge>

        {/* Sustainability indicators */}
        {product.sustainabilityScore && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
                  <Leaf className="h-3.5 w-3.5 text-success" />
                  <span className="text-xs font-medium">{product.sustainabilityScore}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sustainability Score: {product.sustainabilityScore}/100</p>
                {product.co2Estimate && <p>CO2 Footprint: {product.co2Estimate}</p>}
                {product.durabilityWashes && (
                  <p className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    {product.durabilityWashes} washes durability
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {product.brand}
          </p>
          <h3 className="font-medium leading-tight line-clamp-2">{product.name}</h3>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold text-primary">
            {symbol}{product.priceMin}
          </span>
          {product.priceMax > product.priceMin && (
            <span className="text-sm text-muted-foreground">
              - {symbol}{product.priceMax}
            </span>
          )}
        </div>

        {product.reviewSentiment && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.reviewSentiment}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1 gap-1"
            onClick={() => onTryOn(product)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Try On
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDetails(product)}
          >
            Details
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0"
            onClick={() => onSave(product)}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
