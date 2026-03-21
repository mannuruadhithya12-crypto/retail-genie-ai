'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, TrendingUp, TrendingDown, Minus, RefreshCw, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface SentimentData {
  overallSentiment: number
  totalMentions: number
  platforms: {
    name: string
    sentiment: number
    mentions: number
  }[]
  highlights: {
    positive: string[]
    negative: string[]
  }
  trending: 'up' | 'down' | 'stable'
}

interface SocialEchoProps {
  product?: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SocialEchoStats({ product, data: initialData, isLoading: initialLoading }: { product?: Product | null, data?: SentimentData | null, isLoading?: boolean }) {
  const [data, setData] = useState<SentimentData | null>(initialData || null)
  const [isLoading, setIsLoading] = useState(initialLoading || false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchSentiment = async (query?: string) => {
    const targetQuery = query || (product?.name)
    if (!targetQuery) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/social-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: product?.id || 'standalone',
          productName: targetQuery
        })
      })
      const result = await response.json()
      
      if (response.ok && result.success) {
        setData(result)
      }
    } catch (error) {
      console.error('Social Echo AI Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (product && !initialData) {
      fetchSentiment()
    }
  }, [product?.id])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchSentiment(searchQuery)
    }
  }

  const getTrendIcon = () => {
    if (!data) return null
    switch (data.trending) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-400" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-rose-400" />
      default:
        return <Minus className="h-4 w-4 text-slate-400" />
    }
  }

  const getSentimentColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-amber-400'
    return 'text-rose-400'
  }

  return (
    <div className="space-y-6">
      {/* Standalone Search Bar (Only if no product provided) */}
      {!product && (
        <div className="flex gap-2">
          <Input 
            placeholder="Enter product name (e.g. 'Air Jordan 1')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-white/5 border-white/10 focus:border-primary/50 text-sm"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isLoading || !searchQuery.trim()}
            className="bg-primary hover:bg-primary/80 transition-all font-headline text-xs uppercase tracking-widest px-6"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Analyze'}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] uppercase font-headline tracking-[0.3em] text-primary">Crawling Social Networks...</p>
          </div>
          <Skeleton className="h-20 w-full bg-white/5 rounded-2xl" />
          <Skeleton className="h-32 w-full bg-white/5 rounded-2xl" />
        </div>
      ) : data ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          {/* Overall Score Card */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
              <p className="text-3xl font-headline font-bold text-primary mb-1">{data.overallSentiment}%</p>
              <p className="text-[9px] uppercase font-headline tracking-widest text-slate-500">Global Positivity</p>
            </div>
            <div className="p-4 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2 mb-1">
                {getTrendIcon()}
                <span className="text-xl font-headline font-bold">{(data.totalMentions / 1000).toFixed(1)}K</span>
              </div>
              <p className="text-[9px] uppercase font-headline tracking-widest text-slate-500">Active Mentions</p>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="space-y-3 p-5 rounded-3xl bg-white/5 border border-white/5">
            <p className="text-[9px] uppercase font-headline tracking-widest text-slate-500 mb-2">Network Influence</p>
            {data.platforms.map((platform) => (
              <div key={platform.name} className="flex items-center gap-4">
                <span className="text-xs w-24 text-slate-300 font-medium">{platform.name}</span>
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${platform.sentiment}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-primary"
                  />
                </div>
                <span className={`text-[9px] font-headline font-bold w-10 text-right ${getSentimentColor(platform.sentiment)}`}>
                  {platform.sentiment}%
                </span>
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <p className="text-[9px] uppercase font-headline tracking-widest text-emerald-400">Viral Positives</p>
              <div className="flex flex-wrap gap-2">
                {data.highlights.positive.map((h) => (
                  <Badge key={h} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] py-1 rounded-lg">
                    {h}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[9px] uppercase font-headline tracking-widest text-rose-400">Common Critics</p>
              <div className="flex flex-wrap gap-2">
                {data.highlights.negative.map((h) => (
                  <Badge key={h} className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] py-1 rounded-lg">
                    {h}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="py-10 flex flex-col items-center justify-center opacity-30 text-center">
           <TrendingUp className="h-10 w-10 mb-2" />
           <p className="text-xs font-headline uppercase tracking-widest">Awaiting Analysis</p>
        </div>
      )}
    </div>
  )
}

export function SocialEcho({ product, open, onOpenChange }: SocialEchoProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-slate-950 border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 font-headline text-lg">
              <MessageCircle className="h-5 w-5 text-primary" />
              Social Echo Analyzer
            </DialogTitle>
            <DialogDescription className="sr-only">
              Analyze real-time social sentiment for any fashion product
            </DialogDescription>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-slate-400">
               <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="pt-4">
          <SocialEchoStats product={product} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
