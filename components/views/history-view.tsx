'use client'

import Image from 'next/image'
import { History, MessageSquare, Calendar, ChevronRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Empty } from '@/components/ui/empty'
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

interface HistoryViewProps {
  onSelectSession: (id: string) => void
}

export function HistoryView({ onSelectSession }: HistoryViewProps) {
  const { chatSessions, deleteSession } = useAppStore()

  const formatDate = (date: Date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return 'Today'
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return `${days} days ago`
    } else {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    }
  }

  const getPreviewImages = (session: typeof chatSessions[0]) => {
    const images: string[] = []
    for (const message of session.messages) {
      if (message.products) {
        for (const product of message.products) {
          if (images.length < 3) {
            images.push(product.imageUrl)
          }
        }
      }
    }
    return images
  }

  if (chatSessions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Empty
          icon={History}
          title="No chat history"
          description="Your conversations will appear here"
        />
      </div>
    )
  }

  // Group sessions by date
  const groupedSessions = chatSessions.reduce((groups, session) => {
    const date = formatDate(session.updatedAt)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(session)
    return groups
  }, {} as Record<string, typeof chatSessions>)

  return (
    <ScrollArea className="flex-1 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">History</h1>

        <div className="space-y-6">
          {Object.entries(groupedSessions).map(([date, sessions]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{date}</span>
              </div>

              <div className="space-y-2">
                {sessions.map((session) => {
                  const previewImages = getPreviewImages(session)
                  return (
                    <div
                      key={session.id}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 cursor-pointer transition-all bg-card"
                      onClick={() => onSelectSession(session.id)}
                    >
                      {/* Preview images */}
                      <div className="flex -space-x-2">
                        {previewImages.length > 0 ? (
                          previewImages.map((img, i) => (
                            <div
                              key={i}
                              className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-background"
                            >
                              <Image
                                src={img}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this conversation.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSession(session.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
