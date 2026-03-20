'use client'

import { useState } from 'react'
import { Plus, MessageSquare, Heart, History, Settings, Trash2, ChevronLeft, Sparkles, Beaker } from 'lucide-react'
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
  onNavigate: (view: 'chat' | 'outfits' | 'history' | 'preferences' | 'ai-lab') => void
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
        'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-sidebar transition-transform duration-300 md:relative md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Button
          onClick={handleNewChat}
          className="flex-1 gap-2"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <div className="p-3 space-y-1">
        <Button
          variant={currentView === 'outfits' ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-2"
          onClick={() => onNavigate('outfits')}
        >
          <Heart className="h-4 w-4" />
          Saved Outfits
          {savedOutfits.length > 0 && (
            <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {savedOutfits.length}
            </span>
          )}
        </Button>
        <Button
          variant={currentView === 'history' ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-2"
          onClick={() => onNavigate('history')}
        >
          <History className="h-4 w-4" />
          History
        </Button>
        <Button
          variant={currentView === 'preferences' ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-2"
          onClick={() => onNavigate('preferences')}
        >
          <Settings className="h-4 w-4" />
          Preferences
        </Button>
        <Button
          variant={currentView === 'ai-lab' ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-2 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20"
          onClick={() => onNavigate('ai-lab')}
        >
          <Beaker className="h-4 w-4 text-primary" />
          AI Features Lab
          <Sparkles className="h-3 w-3 ml-auto text-accent" />
        </Button>
      </div>

      <Separator />

      {/* Chat Sessions */}
      <div className="flex-1 overflow-hidden">
        <div className="px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Recent Chats
          </span>
        </div>
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-4">
            {chatSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground px-3 py-4">
                No conversations yet. Start a new chat!
              </p>
            ) : (
              chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    'group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors',
                    currentSessionId === session.id && currentView === 'chat'
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50'
                  )}
                  onClick={() => handleSelectSession(session.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate text-sm">{session.title}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this conversation and cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteSession(session.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </aside>
  )
}
