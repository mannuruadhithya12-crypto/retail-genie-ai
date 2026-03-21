'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Upload, X, Loader2, Sparkles, Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'

interface GroupOutfitProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddToChat: (products: Product[], coordinationLogic?: string, themeName?: string) => void
}

interface GroupMember {
  id: string
  name: string
  imageUrl: string | null
  role: 'primary' | 'complement'
}

const occasions = [
  { id: 'wedding', label: 'Family Wedding' },
  { id: 'photo', label: 'Group Photo' },
  { id: 'travel', label: 'Travel Outfits' },
  { id: 'party', label: 'Party / Event' },
  { id: 'formal', label: 'Formal Event' },
]

export function GroupOutfit({ open, onOpenChange, onAddToChat }: GroupOutfitProps) {
  const [members, setMembers] = useState<GroupMember[]>([
    { id: '1', name: 'You', imageUrl: null, role: 'primary' },
  ])
  const [occasion, setOccasion] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{ memberId: string; products: Product[] }[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<{coordinationLogic?: string, themeName?: string}>({})

  const handleAddMember = () => {
    if (members.length >= 4) {
      toast.error('Maximum 4 people supported')
      return
    }
    setMembers([
      ...members,
      { id: crypto.randomUUID(), name: `Person ${members.length + 1}`, imageUrl: null, role: 'complement' },
    ])
  }

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) return
    setMembers(members.filter((m) => m.id !== id))
  }

  const handleImageUpload = (memberId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setMembers(
          members.map((m) =>
            m.id === memberId ? { ...m, imageUrl: event.target?.result as string } : m
          )
        )
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNameChange = (memberId: string, name: string) => {
    setMembers(members.map((m) => (m.id === memberId ? { ...m, name } : m)))
  }

  const handleGenerate = async () => {
    const membersWithPhotos = members.filter((m) => m.imageUrl)
    if (membersWithPhotos.length === 0) {
      toast.error('Please upload at least one photo')
      return
    }
    if (!occasion) {
      toast.error('Please select an occasion')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setResults([])

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95
        return prev + Math.random() * 5
      })
    }, 500)

    try {
      const occName = occasions.find(o => o.id === occasion)?.label || occasion;
      const response = await fetch('/api/ai/group-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occasion: occName, members: membersWithPhotos })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAiAnalysis({ coordinationLogic: data.coordinationLogic, themeName: data.themeName });
        
        const mappedResults = membersWithPhotos.map(member => {
           const piece = (data.pieces || []).find((p: any) => p.memberId === member.id);
           const sp = piece?.scrapedProduct;
           
           return {
             memberId: member.id,
             products: sp ? [{
                id: crypto.randomUUID(),
                name: sp.name,
                brand: sp.brand,
                imageUrl: sp.imageUrl,
                priceMin: sp.price,
                priceMax: sp.priceMax || sp.price,
                currency: sp.currency,
                productUrl: sp.productUrl,
                verdict: 'strong-buy',
                verdictReasons: [piece.outfitQuery],
                retailers: []
             } as Product] : []
           }
        });

        setResults(mappedResults);
        toast.success(`Generated: ${data.themeName}`);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to coordinate group outfits.');
    } finally {
      clearInterval(interval)
      setProgress(100)
      setIsGenerating(false)
    }
  }

  const handleAddAllToChat = () => {
    const allProducts = results.flatMap((r) => r.products)
    onAddToChat(allProducts, aiAnalysis.coordinationLogic, aiAnalysis.themeName)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Family / Group Coordination Mode
          </DialogTitle>
          <DialogDescription className="sr-only">
            Upload photos for up to 4 people to generate coordinated outfits
          </DialogDescription>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Upload photos for up to 4 people to generate coordinated outfits for your group
          </p>

          {/* Occasion Selection */}
          <div className="space-y-2">
            <Label>Occasion</Label>
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger>
                <SelectValue placeholder="Select an occasion" />
              </SelectTrigger>
              <SelectContent>
                {occasions.map((occ) => (
                  <SelectItem key={occ.id} value={occ.id}>
                    {occ.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Group Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Group Members ({members.length}/4)</Label>
              <Button variant="outline" size="sm" onClick={handleAddMember} disabled={members.length >= 4}>
                <Plus className="h-4 w-4 mr-1" />
                Add Person
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {members.map((member, index) => (
                <div key={member.id} className="space-y-2 p-3 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between">
                    <Input
                      value={member.name}
                      onChange={(e) => handleNameChange(member.id, e.target.value)}
                      className="h-8 text-sm"
                    />
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 ml-1"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  {member.imageUrl ? (
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                      <Image src={member.imageUrl} alt={member.name} fill className="object-cover" />
                      <label className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="text-xs font-medium">Change</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(member.id, e)}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <span className="text-xs">Upload photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(member.id, e)}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Coordinating Outfits...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Coordinated Outfits
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {Math.round(progress)}% - Analyzing style compatibility...
              </p>
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Coordinated Outfits</h3>
                  <Button size="sm" onClick={handleAddAllToChat}>
                    Add All to Chat
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {results.map((result) => {
                    const member = members.find((m) => m.id === result.memberId)
                    return (
                      <div key={result.memberId} className="p-4 rounded-xl border border-border bg-card space-y-3">
                        <p className="font-medium">{member?.name}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {result.products.map((product) => (
                            <div key={product.id} className="space-y-1">
                              <div className="relative aspect-square rounded-lg overflow-hidden">
                                <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <p className="text-xs truncate">{product.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
