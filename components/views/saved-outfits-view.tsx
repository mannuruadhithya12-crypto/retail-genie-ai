'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  Share2, 
  ChevronDown, 
  Filter, 
  Sparkles, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Maximize2,
  Plus,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function SavedOutfitsView() {
  const { savedOutfits, deleteOutfit } = useAppStore()
  const [activeFilter, setActiveFilter] = useState('All')

  const collections = [
    { id: '1', name: 'Neon City Night', count: 12, time: '2d ago', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600' },
    { id: '2', name: 'Digital Nomad', count: 8, time: '1w ago', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600' },
    { id: '3', name: 'Virtual Gala', count: 5, time: '3d ago', image: 'https://images.unsplash.com/photo-1514525253344-99a4217af2d9?auto=format&fit=crop&q=80&w=600' },
    { id: '4', name: 'Metropolis Flow', count: 15, time: '5h ago', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=600' },
  ]

  const mockSavedOutfits = [
    {
      id: 'm1',
      name: 'Cyber-Denie V1',
      thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
      createdAt: new Date(),
      notes: 'Neon-soaked street aesthetic',
      products: []
    },
    {
      id: 'm2',
      name: 'Oasis Minimal',
      thumbnailUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
      createdAt: new Date(),
      notes: 'Earthy tones for digital flow',
      products: []
    },
    {
      id: 'm3',
      name: 'Etheric Gala',
      thumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
      createdAt: new Date(),
      notes: 'Virtual red carpet silhouette',
      products: []
    }
  ]

  const displayOutfits = savedOutfits.length > 0 ? savedOutfits : mockSavedOutfits

  return (
    <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        
        {/* Header Section */}
        <section>
          <h1 className="text-5xl font-bold font-headline tracking-tighter text-white mb-2">Your Curated Archive</h1>
          <p className="text-slate-400 text-lg font-light tracking-wide">AI-saved looks and personalized style collections.</p>
        </section>

        {/* Featured Collections Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline uppercase tracking-[0.2em] text-[10px] text-secondary font-bold">Featured Collections</h3>
            <Button variant="link" className="text-xs text-slate-500 hover:text-primary transition-colors p-0 h-auto">View All</Button>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
            {collections.map((col) => (
              <motion.div 
                key={col.id}
                whileHover={{ y: -4 }}
                className="flex-shrink-0 w-64 h-40 glass-panel rounded-2xl border border-white/10 p-6 flex flex-col justify-end group cursor-pointer overflow-hidden relative shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] to-transparent opacity-70 z-10" />
                <Image 
                  src={col.image} 
                  alt={col.name} 
                  fill 
                  className="object-cover -z-10 group-hover:scale-110 transition-transform duration-700" 
                />
                <h4 className="font-headline text-lg font-bold text-white relative z-20">{col.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest relative z-20">
                  {col.count} Looks • Created {col.time}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Filter Bar */}
        <section className="flex flex-wrap gap-4 items-center border-b border-white/5 pb-8">
          {['Style', 'Occasion', 'Season'].map((filter) => (
            <div key={filter} className="relative group">
              <Button 
                variant="ghost" 
                className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all px-6 py-6 rounded-xl flex items-center gap-4 text-slate-400 hover:text-white min-w-[140px]"
              >
                <span className="text-sm font-medium">{filter}</span>
                <ChevronDown className="h-4 w-4 ml-auto" />
              </Button>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 text-slate-500">
            <Filter className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Sort By: Newest</span>
          </div>
        </section>

        {/* Style Vault Main Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {displayOutfits.map((outfit) => (
            <motion.div 
              key={outfit.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-3xl border border-white/10 overflow-hidden flex flex-col group h-[620px] shadow-2xl relative"
            >
              <div className="relative h-2/3 overflow-hidden">
                <Image 
                  src={outfit.thumbnailUrl} 
                  alt={outfit.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-1000" 
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      size="icon" 
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-tertiary-dim hover:border-transparent transition-all"
                    >
                      <Heart className="h-5 w-5 fill-white" />
                    </Button>
                  </motion.div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-error-container transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-panel border-white/10 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Archive this look?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          This will permanently remove this outfit from your curated vault.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteOutfit(outfit.id)}
                          className="bg-error-container text-white"
                        >
                          Archive
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                {/* Visual Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-transparent to-transparent opacity-60" />
              </div>

              <div className="p-8 flex flex-col flex-1 relative z-10 bg-gradient-to-b from-[#0c0e12]/80 to-[#0c0e12]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-white mb-1">{outfit.name}</h3>
                    <p className="text-slate-400 text-sm italic font-light">"Precision AI curation from your session"</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
                    Curated
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {['#Aura', '#Modern', '#GenieSelected'].map((tag) => (
                    <span key={tag} className="text-[10px] uppercase font-bold text-secondary-dim tracking-wider">{tag}</span>
                  ))}
                </div>

                <div className="mt-auto flex gap-4">
                  <Button className="flex-1 h-12 bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-bold rounded-xl active:scale-95 transition-transform shadow-[0_0_15px_rgba(219,144,255,0.3)] border-none">
                    <Maximize2 className="mr-2 h-4 w-4" /> Try On
                  </Button>
                  <Button variant="outline" className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 p-0">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </section>
      </div>

      {/* Floating AI Input Bar */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', damping: 20 }}
        className="fixed bottom-12 left-[calc(20rem+3rem)] right-12 z-50 pointer-events-none px-4"
      >
        <div className="max-w-2xl mx-auto glass-panel p-2.5 rounded-full border border-primary/30 shadow-[0_0_50px_rgba(219,144,255,0.15)] pointer-events-auto flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary ml-1 shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5 fill-on-primary/20" />
          </div>
          <input 
            className="bg-transparent border-none focus:ring-0 flex-1 px-5 text-sm text-white placeholder:text-slate-500 font-medium" 
            placeholder="Organize my archive by dominant color..." 
            type="text"
          />
          <Button className="bg-secondary hover:bg-secondary-dim text-white font-bold h-10 px-6 rounded-full text-[10px] uppercase tracking-widest mr-1 transition-all active:scale-95 shadow-lg shadow-secondary/20">
            <Send className="h-3.5 w-3.5 mr-2" /> Send
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
