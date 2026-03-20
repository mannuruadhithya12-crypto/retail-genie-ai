'use client'

import Image from 'next/image'
import { History, Calendar, ArrowRight, Trash2, Clock, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
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
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface HistoryViewProps {
  onSelectSession: (id: string) => void
}

export function HistoryView({ onSelectSession }: HistoryViewProps) {
  const { chatSessions, deleteSession } = useAppStore()

  const formatDateLabel = (date: Date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getPreviewImage = (session: typeof chatSessions[0]) => {
    for (const message of session.messages) {
      if (message.products && message.products.length > 0) {
        return message.products[0].imageUrl
      }
    }
    return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800' // Fallback
  }

  if (chatSessions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Empty className="max-w-md border-0 bg-transparent">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <History className="size-6 text-primary" />
            </EmptyMedia>
            <EmptyTitle className="text-white text-2xl font-headline">Archive is empty</EmptyTitle>
            <EmptyDescription className="text-slate-400">Your curated looks will be preserved here</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Hero */}
      <section className="mb-20 max-w-4xl">
        <h2 className="text-6xl font-headline font-bold tracking-tight mb-4 text-white">
          Styling <span className="text-primary italic">Archive</span>
        </h2>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
          Revisit your digital evolution. Your history of curated looks and AI-driven fashion dialogues, preserved in the atelier vault.
        </p>
      </section>

      {/* Timeline UI Layout */}
      <div className="relative">
        {/* Central Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-primary via-secondary/20 to-transparent"></div>

        <div className="space-y-16">
          {chatSessions.map((session, index) => {
            const previewImage = getPreviewImage(session)
            const dateLabel = formatDateLabel(session.updatedAt)
            const timeLabel = formatTime(session.updatedAt)

            return (
              <motion.div 
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-24 group"
              >
                {/* Timeline Marker */}
                <div className={cn(
                  "absolute left-6 top-8 w-5 h-5 rounded-full border-4 border-background z-10 transition-transform duration-300 group-hover:scale-125 shadow-lg",
                  index === 0 ? "bg-primary shadow-primary/40" : "bg-secondary shadow-secondary/40"
                )}></div>
                
                <span className="absolute left-0 top-8 -translate-x-full text-[10px] font-headline font-bold uppercase tracking-tight text-slate-500 pr-8 mt-1 whitespace-nowrap">
                  {dateLabel}
                </span>

                {/* Glass Card */}
                <div 
                  className="glass-morphism p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-all duration-500 group-hover:translate-x-2 shadow-2xl flex flex-col md:flex-row gap-8 cursor-pointer relative overflow-hidden"
                  onClick={() => onSelectSession(session.id)}
                >
                  {/* Image Preview */}
                  <div className="relative w-full md:w-48 h-64 overflow-hidden rounded-2xl border border-white/10 flex-shrink-0">
                    <Image 
                      src={previewImage}
                      alt={session.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <span className="px-2 py-1 rounded bg-secondary/20 backdrop-blur-md text-[10px] font-bold text-secondary uppercase tracking-widest border border-secondary/30">
                        {session.messages.length > 5 ? 'STREETWEAR' : 'ELEGANCE'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-headline font-medium text-white truncate pr-4">{session.title}</h3>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-mono shrink-0">
                          <Clock className="h-3 w-3" />
                          {timeLabel}
                        </div>
                      </div>
                      <p className="text-slate-400 line-clamp-3 mb-6 leading-relaxed text-base italic">
                        "{session.messages[session.messages.length - 1]?.content || 'Starting a new style journey...'}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          {[1, 2].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                              {i === 1 ? 'AI' : 'SG'}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3 w-3 text-secondary" />
                          <span className="text-[10px] font-headline uppercase tracking-widest text-secondary font-bold">
                            AI Generated • {session.messages.length} Items
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-destructive transition-all hover:bg-destructive/10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-morphism border-white/10 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Session?</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-400">
                                This will permanently remove this style dialogue from the atelier vault.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSession(session.id)}
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <button className="flex items-center gap-2 text-xs font-headline font-bold uppercase tracking-widest text-primary hover:gap-4 transition-all">
                          View Full Session <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Pagination/Load More */}
      <div className="flex justify-center mt-24 mb-32">
        <button className="group flex flex-col items-center gap-4 transition-all">
          <span className="text-[10px] font-headline font-bold uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors">Load Older Sessions</span>
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-300">
            <ArrowRight className="h-5 w-5 rotate-90 text-slate-500 group-hover:text-primary transition-colors" />
          </div>
        </button>
      </div>
    </div>
  )
}
