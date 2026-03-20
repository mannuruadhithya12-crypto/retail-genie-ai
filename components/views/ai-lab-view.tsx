'use client'

import { motion } from 'framer-motion'
import {
  Clock,
  Users,
  Globe,
  Mic,
  TrendingUp,
  MapPin,
  Heart,
  CalendarDays,
  Sparkles,
  Leaf,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AILabViewProps {
  onFeatureClick: (feature: string) => void
}

const features = [
  {
    id: 'mood',
    name: 'Mood-to-Outfit Translator',
    description: 'Describe your emotions and get outfit suggestions based on color psychology',
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    status: 'live',
  },
  {
    id: 'aging',
    name: 'Outfit Aging Simulator',
    description: 'See how garments will look after 10 washes, 6 months, or 1 year of wear',
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    status: 'live',
  },
  {
    id: 'group',
    name: 'Family/Group Coordination',
    description: 'Upload photos for up to 4 people and get coordinated outfit suggestions',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    status: 'live',
  },
  {
    id: 'cultural',
    name: 'Cultural Fusion Creator',
    description: 'Blend fashion elements from different cultures for unique hybrid styles',
    icon: Globe,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    status: 'live',
  },
  {
    id: 'voice',
    name: 'Voice Personal Stylist',
    description: 'Speak your style requests and get personalized recommendations',
    icon: Mic,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    status: 'live',
  },
  {
    id: 'future',
    name: 'Future Style Predictor',
    description: 'AI predicts your style evolution and recommends future-proof purchases',
    icon: TrendingUp,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    status: 'live',
  },
  {
    id: 'calendar',
    name: 'Calendar Outfit Planner',
    description: 'Plan outfits for upcoming events with AI-powered suggestions',
    icon: CalendarDays,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    status: 'live',
  },
  {
    id: 'location',
    name: 'Real-Life Location Overlay',
    description: 'See your outfit in different environments like office, beach, or street',
    icon: MapPin,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    status: 'live',
  },
  {
    id: 'sustainability',
    name: 'Sustainability Focus',
    description: 'Filter recommendations by eco-friendliness, durability, and CO2 impact',
    icon: Leaf,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    status: 'live',
  },
  {
    id: 'social',
    name: 'Social Echo Checker',
    description: 'See live sentiment from social media about any product',
    icon: MessageCircle,
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
    status: 'live',
  },
]

export function AILabView({ onFeatureClick }: AILabViewProps) {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Features Lab</span>
          </div>
          <h1 className="text-3xl font-bold">Breakthrough AI Features</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore 10 innovative AI-powered features that no other shopping assistant offers.
            Each feature is designed to enhance your personal styling experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full"
                onClick={() => onFeatureClick(feature.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl ${feature.bgColor}`}>
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-success/10 text-success border-success/20"
                    >
                      Live
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-3 group-hover:text-primary transition-colors">
                    {feature.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            All features use advanced AI to provide personalized recommendations based on your preferences
          </p>
          <Button variant="outline" onClick={() => onFeatureClick('mood')}>
            Get Started with Mood Stylist
          </Button>
        </div>
      </div>
    </div>
  )
}
