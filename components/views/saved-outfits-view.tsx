'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, Trash2, Edit2, ExternalLink, Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import type { SavedOutfit } from '@/lib/types'

export function SavedOutfitsView() {
  const { savedOutfits, deleteOutfit, updateOutfitNotes } = useAppStore()
  const [selectedOutfit, setSelectedOutfit] = useState<SavedOutfit | null>(null)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState('')

  const startEditingNotes = (outfit: SavedOutfit) => {
    setEditingNotes(outfit.id)
    setNotesValue(outfit.notes)
  }

  const saveNotes = (id: string) => {
    updateOutfitNotes(id, notesValue)
    setEditingNotes(null)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (savedOutfits.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Empty
          icon={Heart}
          title="No saved outfits yet"
          description="When you save outfits from the chat or try-on, they will appear here"
        />
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Saved Outfits</h1>
          <span className="text-muted-foreground">
            {savedOutfits.length} outfit{savedOutfits.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {savedOutfits.map((outfit) => (
            <Card
              key={outfit.id}
              className="group overflow-hidden cursor-pointer hover:border-primary/30 transition-all"
              onClick={() => setSelectedOutfit(outfit)}
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={outfit.thumbnailUrl}
                  alt={outfit.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete outfit?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this saved outfit.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteOutfit(outfit.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-medium text-sm truncate">{outfit.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(outfit.createdAt)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Outfit Detail Dialog */}
      <Dialog open={!!selectedOutfit} onOpenChange={() => setSelectedOutfit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedOutfit?.name}</DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedOutfit(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          {selectedOutfit && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border">
                <Image
                  src={selectedOutfit.thumbnailUrl}
                  alt={selectedOutfit.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Saved on {formatDate(selectedOutfit.createdAt)}
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Notes</span>
                    {editingNotes !== selectedOutfit.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingNotes(selectedOutfit)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {editingNotes === selectedOutfit.id ? (
                    <div className="space-y-2">
                      <Input
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        placeholder="Add notes about this outfit..."
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveNotes(selectedOutfit.id)}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingNotes(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {selectedOutfit.notes || 'No notes yet'}
                    </p>
                  )}
                </div>

                {/* Products in outfit */}
                {selectedOutfit.products.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Items</span>
                    <div className="space-y-2">
                      {selectedOutfit.products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50"
                        >
                          <div className="relative w-12 h-12 rounded-md overflow-hidden">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="shrink-0">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ScrollArea>
  )
}
