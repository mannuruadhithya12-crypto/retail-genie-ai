'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
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

const verdictConfig: Record<string, { label: string; className: string; icon: any }> = {
  'strong-buy': { label: 'Strong Buy', className: 'bg-green-600 text-white', icon: Sparkles },
  'Strong Buy':  { label: 'Strong Buy', className: 'bg-green-600 text-white', icon: Sparkles },
  'consider':    { label: 'Consider',   className: 'bg-yellow-500 text-black', icon: Eye },
  'Consider':    { label: 'Consider',   className: 'bg-yellow-500 text-black', icon: Eye },
  'skip':        { label: 'Skip',       className: 'bg-red-600 text-white', icon: null },
  'Skip':        { label: 'Skip',       className: 'bg-red-600 text-white', icon: null },
}

export function ProductCard({ product, onTryOn, onSave, onDetails }: ProductCardProps) {
  const router = useRouter();
  const verdict = verdictConfig[product.verdict] || verdictConfig['consider'];
  const currencySymbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥',
    CNY: '¥', AUD: 'A$', CAD: 'C$', BRL: 'R$', KRW: '₩',
  };
  const symbol = currencySymbols[product.currency] || '$';
  // Support both LiveProduct (productUrl) and legacy Product (retailers[0].url)
  const buyUrl = (product as any).productUrl || product.retailers?.[0]?.url;
  const displayPrice = product.priceMin || (product as any).price || 0;
  const imgSrc = (product as any).imageUrl || product.imageUrl || 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=500&fit=crop';

  return (
    <Card className="group overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={product.name}
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1603217192634-61068e4d4bf9?w=400&h=500&fit=crop'; }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        {/* Verdict Badge */}
        {verdict && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={cn('absolute top-3 right-3 cursor-help', verdict.className)}>
                  {verdict.icon && <verdict.icon className="h-3 w-3 mr-1" />}
                  {verdict.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold mb-1">Our Prediction: {verdict.label}</p>
                {product.verdictReasons?.map((r, i) => (
                  <p key={i} className="text-xs text-muted-foreground">• {r}</p>
                ))}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

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
            {symbol}{displayPrice > 0 ? displayPrice.toFixed(0) : 'View Price'}
          </span>
          {product.priceMax > product.priceMin && displayPrice > 0 && (
            <span className="text-sm text-muted-foreground">
              – {symbol}{product.priceMax.toFixed(0)}
            </span>
          )}
        </div>

        {product.reviewSentiment && (
          <div className="bg-secondary/10 p-2 rounded-md border border-secondary/20">
            <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-0.5">Reviews Summary</p>
            <p className="text-xs text-muted-foreground line-clamp-2 italic">
              "{product.reviewSentiment}"
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1 gap-1"
            onClick={() => {
               const modelParam = (product as any).modelUrl ? `&model=${encodeURIComponent((product as any).modelUrl)}` : '';
               router.push(`/ar?name=${encodeURIComponent(product.name)}&image=${encodeURIComponent(imgSrc)}${modelParam}`);
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Try AR
          </Button>
          
          {buyUrl ? (
            <Button size="sm" className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700" asChild>
              <a href={buyUrl} target="_blank" rel="noopener noreferrer">Buy Now →</a>
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onDetails(product)}>
              Details
            </Button>
          )}

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
