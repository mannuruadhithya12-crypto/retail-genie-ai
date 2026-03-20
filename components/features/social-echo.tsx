'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, TrendingUp, TrendingDown, Minus, RefreshCw, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product } from '@/lib/types'

interface SocialEchoProps {
  product: Product
}

interface SentimentData {
  overallScore: number
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

export function SocialEcho({ product }: SocialEchoProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<SentimentData | null>(null)

  useEffect(() => {
    const fetchSentiment = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock sentiment data
      setData({
        overallScore: 78 + Math.floor(Math.random() * 15),
        totalMentions: 1200 + Math.floor(Math.random() * 800),
        platforms: [
          { name: 'X (Twitter)', sentiment: 82, mentions: 450 },
          { name: 'Reddit', sentiment: 76, mentions: 320 },
          { name: 'Instagram', sentiment: 85, mentions: 280 },
          { name: 'TikTok', sentiment: 79, mentions: 350 },
        ],
        highlights: {
          positive: [
            'Breathable fabric',
            'True to size',
            'Great for layering',
            'Premium feel',
          ],
          negative: [
            'Runs small in arms',
            'Limited color options',
          ],
        },
        trending: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
      })
      setIsLoading(false)
    }

    fetchSentiment()
  }, [product.id])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setData((prev) =>
        prev
          ? {
              ...prev,
              overallScore: 70 + Math.floor(Math.random() * 25),
              totalMentions: prev.totalMentions + Math.floor(Math.random() * 50),
            }
          : null
      )
      setIsLoading(false)
    }, 1000)
  }

  const getTrendIcon = () => {
    if (!data) return null
    switch (data.trending) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-destructive" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getSentimentColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-warning'
    return 'text-destructive'
  }

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              Social Echo
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Score */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <div>
              <p className="text-2xl font-bold">{data.overallScore}%</p>
              <p className="text-xs text-muted-foreground">Positive sentiment</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className="text-sm font-medium">{data.totalMentions.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">mentions</p>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              By Platform
            </p>
            {data.platforms.map((platform) => (
              <div key={platform.name} className="flex items-center gap-3">
                <span className="text-xs w-20 truncate">{platform.name}</span>
                <Progress value={platform.sentiment} className="flex-1 h-1.5" />
                <span className={`text-xs font-medium w-8 ${getSentimentColor(platform.sentiment)}`}>
                  {platform.sentiment}%
                </span>
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-success">People love</p>
              <div className="flex flex-wrap gap-1.5">
                {data.highlights.positive.map((highlight) => (
                  <Badge key={highlight} variant="secondary" className="text-xs bg-success/10 text-success">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>
            {data.highlights.negative.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-destructive">Watch out for</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.highlights.negative.map((highlight) => (
                    <Badge
                      key={highlight}
                      variant="secondary"
                      className="text-xs bg-destructive/10 text-destructive"
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" className="w-full gap-2">
            <ExternalLink className="h-3.5 w-3.5" />
            View All Reviews
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
