'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Palette, 
  HelpCircle, 
  Camera, 
  Archive, 
  Zap, 
  BrainCircuit, 
  Maximize,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardViewProps {
  onStartStyling: () => void
  onTryVirtualOutfit?: () => void
}

export function DashboardView({ onStartStyling, onTryVirtualOutfit = () => {} }: DashboardViewProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background text-on-background font-body selection:bg-primary/30">
      <div className="max-w-7xl mx-auto px-6 py-12 md:px-12 lg:py-20">
        
        {/* Hero Section */}
        <section className="relative mb-24 flex flex-col items-center text-center">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-highest text-primary text-[10px] font-bold uppercase tracking-widest mb-8 border border-primary/10 bg-white/5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-ai"></span>
            v4.0 Generative Styling Live
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-headline text-5xl md:text-8xl font-bold tracking-tighter text-on-background mb-8 leading-[0.9]"
          >
            Your AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#db90ff] to-[#5f9eff]">Fashion Universe</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
          >
            Try outfits, explore styles, and get AI-powered recommendations in real time. The future of couture, engineered for you.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <Button 
              size="lg"
              className="liquid-light-btn px-10 py-7 rounded-2xl font-headline font-bold text-on-primary shadow-[0_0_30px_rgba(219,144,255,0.4)] hover:scale-105 transition-transform text-lg"
              onClick={onStartStyling}
            >
              Start Styling
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="glass-morphism px-10 py-7 rounded-2xl font-headline font-bold text-on-surface border border-white/10 hover:bg-white/5 transition-all text-lg"
              onClick={onTryVirtualOutfit}
            >
              Try Virtual Outfit
            </Button>
          </motion.div>
        </section>

        {/* Quick Action Chips */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-24"
        >
          {[
            { icon: TrendingUp, label: 'Daily Trends', color: 'text-secondary', border: 'hover:border-secondary/40' },
            { icon: Palette, label: 'Color Palette', color: 'text-primary', border: 'hover:border-primary/40' },
            { icon: HelpCircle, label: 'Style Quiz', color: 'text-tertiary', border: 'hover:border-tertiary/40' },
            { icon: Camera, label: 'Visual Search', color: 'text-on-surface-variant', border: 'hover:border-white/20' }
          ].map((chip, idx) => (
            <motion.button 
              key={idx}
              variants={item}
              className={`group flex items-center gap-3 px-6 py-3 rounded-full bg-surface-container-highest border border-white/5 ${chip.border} transition-all duration-500`}
            >
              <chip.icon className={`${chip.color} w-4 h-4 group-hover:scale-110 transition-transform`} />
              <span className="text-sm font-medium tracking-tight">{chip.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* AI Feature Grid */}
        <motion.section 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Main Card: Smart Wardrobe */}
          <motion.div 
            variants={item}
            className="md:col-span-8 group relative overflow-hidden rounded-3xl glass-morphism p-8 gradient-border-trace transition-all duration-500 hover:-translate-y-1"
          >
            <Archive className="absolute top-0 right-0 m-8 text-secondary/10 w-32 h-32 group-hover:opacity-20 transition-opacity" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Archive className="text-secondary w-8 h-8" />
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-secondary animate-pulse-ai"></span>
                  Live AI Analysis
                </span>
              </div>
              <h3 className="font-headline text-3xl font-bold mb-4">Smart Wardrobe</h3>
              <p className="text-on-surface-variant max-w-md mb-8">
                Our AI categorizes your existing clothes and creates infinite outfit combinations based on current weather and your mood.
              </p>
              <Button variant="link" className="text-secondary p-0 h-auto font-bold text-sm group/btn">
                Open Wardrobe
                <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>

          {/* Card: Trend Predictor */}
          <motion.div 
            variants={item}
            className="md:col-span-4 group relative overflow-hidden rounded-3xl glass-morphism p-8 gradient-border-trace transition-all duration-500 hover:-translate-y-1"
          >
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
                <Zap className="text-primary w-8 h-8" />
              </div>
              <h3 className="font-headline text-2xl font-bold mb-4">Trend Predictor</h3>
              <p className="text-on-surface-variant text-sm mb-auto">
                Forecasts the next 48 hours of high-street fashion trends using global social data.
              </p>
              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex -space-x-3 mb-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-surface-container-highest" />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest border-2 border-background flex items-center justify-center text-[10px] font-bold text-on-surface-variant">+12k</div>
                </div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Active predictions now</p>
              </div>
            </div>
          </motion.div>

          {/* Card: Style Analyst */}
          <motion.div 
            variants={item}
            className="md:col-span-5 group relative overflow-hidden rounded-3xl glass-morphism p-8 gradient-border-trace transition-all duration-500 hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
              <BrainCircuit className="text-primary w-8 h-8" />
            </div>
            <h3 className="font-headline text-2xl font-bold mb-4">Style Analyst</h3>
            <p className="text-on-surface-variant text-sm">
              Upload a photo and get instant professional feedback on color theory, fit, and proportions.
            </p>
          </motion.div>

          {/* Card: Fabric Intelligence */}
          <motion.div 
            variants={item}
            className="md:col-span-7 group relative overflow-hidden rounded-3xl glass-morphism p-8 gradient-border-trace transition-all duration-500 hover:-translate-y-1 flex items-center"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
              <div>
                <h3 className="font-headline text-2xl font-bold mb-4">Fabric Intelligence</h3>
                <p className="text-on-surface-variant text-sm">
                  Scan tags to understand sustainability scores and care instructions automatically.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-secondary/30 animate-[spin_10s_linear_infinite]"></div>
                  <Maximize className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary w-12 h-12" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  )
}
