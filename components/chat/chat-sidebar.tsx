'use client'

import { useState } from 'react'
import { Plus, MessageSquare, Heart, History, Settings, Trash2, ChevronLeft, Sparkles, Beaker, LayoutDashboard, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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

interface ChatSidebarProps {
  onNavigate: (view: 'dashboard' | 'chat' | 'outfits' | 'history' | 'preferences' | 'ai-lab') => void
  currentView: string
}

export function ChatSidebar({ onNavigate, currentView }: ChatSidebarProps) {
  const {
    chatSessions,
    currentSessionId,
    createNewSession,
    setCurrentSession,
    deleteSession,
    savedOutfits,
    sidebarOpen,
    setSidebarOpen,
  } = useAppStore()

  const handleNewChat = () => {
    createNewSession()
    onNavigate('chat')
  }

  const handleSelectSession = (id: string) => {
    setCurrentSession(id)
    onNavigate('chat')
  }

  return (
    <aside
      className={cn(
        'fixed left-4 top-4 bottom-4 w-72 z-50 flex flex-col p-6 rounded-[2rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 shadow-[0_0_40px_rgba(219,144,255,0.04)]',
        sidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)]'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary tracking-tighter leading-none">Retail-Genie</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">AI STYLIST ONLINE</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-2">
        <Button
          onClick={handleNewChat}
          className={cn(
            "w-full justify-start gap-3 h-12 px-4 rounded-2xl transition-all duration-300",
            currentView === 'chat' ? "bg-primary/20 text-primary shadow-[0_0_20px_rgba(219,144,255,0.2)]" : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
          )}
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">New Chat</span>
        </Button>

        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { id: 'outfits', icon: Heart, label: 'Saved Outfits' },
          { id: 'history', icon: History, label: 'History' },
          { id: 'preferences', icon: Settings, label: 'Preferences' },
          { id: 'ai-lab', icon: Beaker, label: 'AI Features Lab' },
        ].map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-12 px-4 rounded-2xl transition-all duration-300",
              currentView === item.id ? "text-primary bg-primary/5" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
            onClick={() => onNavigate(item.id as any)}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Button>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="mt-auto space-y-4">
        <Button 
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all scale-100 hover:scale-[1.02] active:scale-95"
        >
          Upgrade to Pro
        </Button>
        
        <div className="pt-4 border-t border-white/5 space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 h-10 px-4 text-slate-400 hover:text-white transition-colors text-sm rounded-xl">
            <HelpCircle className="h-4 w-4" />
            <span>Support</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-10 px-4 text-slate-400 hover:text-white transition-colors text-sm rounded-xl">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>
    </aside>
  )
}
