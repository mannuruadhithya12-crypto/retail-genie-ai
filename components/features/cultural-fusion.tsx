'use client'

import { useState } from 'react'
import { Globe, X, Sparkles, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

const cultureSuggestions = [
  'Japanese',
  'Korean',
  'Indian',
  'African',
  'Scandinavian',
  'Mediterranean',
  'Latin American',
  'Middle Eastern',
  'Western',
  'Chinese',
  'Southeast Asian',
  'European',
]

interface CulturalFusionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (cultures: string[]) => void
}

export function CulturalFusion({ open, onOpenChange, onGenerate }: CulturalFusionProps) {
  const [selectedCultures, setSelectedCultures] = useState<string[]>([])
  const [customCulture, setCustomCulture] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const toggleCulture = (culture: string) => {
    setSelectedCultures((prev) =>
      prev.includes(culture)
        ? prev.filter((c) => c !== culture)
        : prev.length < 4
        ? [...prev, culture]
        : prev
    )
  }

  const addCustomCulture = () => {
    if (customCulture.trim() && selectedCultures.length < 4) {
      if (!selectedCultures.includes(customCulture.trim())) {
        setSelectedCultures([...selectedCultures, customCulture.trim()])
      }
      setCustomCulture('')
    }
  }

  const handleGenerate = async () => {
    if (selectedCultures.length < 2) return
    
    setIsProcessing(true)
    try {
      const response = await fetch('/api/ai/cultural-fusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ styles: selectedCultures }),
      })
      const data = await response.json()
      if (data.success) {
        setResult(data)
        onGenerate(selectedCultures)
      }
    } catch (error) {
      console.error('Fusion error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Cultural Fusion Creator
            </DialogTitle>
            <DialogDescription className="sr-only">
              Mix fashion elements from different cultures to create unique outfits
            </DialogDescription>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {!result ? (
            <>
              <div>
                <p className="text-muted-foreground mb-4">
                  Mix fashion elements from different cultures to create unique hybrid outfit concepts. Select up to 4 cultural influences.
                </p>

                {/* Selected cultures */}
                {selectedCultures.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedCultures.map((culture) => (
                      <Badge
                        key={culture}
                        variant="default"
                        className="gap-1 cursor-pointer"
                        onClick={() => toggleCulture(culture)}
                      >
                        {culture}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Culture suggestions */}
              <div className="space-y-2">
                <Label>Cultural Influences</Label>
                <div className="flex flex-wrap gap-2">
                  {cultureSuggestions.map((culture) => {
                    const isSelected = selectedCultures.includes(culture)
                    return (
                      <Badge
                        key={culture}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer transition-all hover:scale-105"
                        onClick={() => toggleCulture(culture)}
                      >
                        {culture}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              {/* Custom input */}
              <div className="space-y-2">
                <Label htmlFor="custom-culture">Add Custom Culture</Label>
                <div className="flex gap-2">
                  <Input
                    id="custom-culture"
                    placeholder="e.g., Bohemian, Victorian..."
                    value={customCulture}
                    onChange={(e) => setCustomCulture(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomCulture()}
                    disabled={selectedCultures.length >= 4}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={addCustomCulture}
                    disabled={!customCulture.trim() || selectedCultures.length >= 4}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedCultures.length}/4 cultures selected
                </p>
              </div>
            </>
          ) : (
              <div className="space-y-4 animate-in fade-in zoom-in-95">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h3 className="font-bold text-primary mb-1">{result.lookName}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.description}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Fusion Pieces</Label>
                <div className="grid grid-cols-1 gap-3">
                  {result.pieces?.map((piece: any, i: number) => {
                    const product = piece.scrapedProduct;
                    return (
                      <div key={i} className="flex gap-4 p-3 rounded-xl bg-card border border-border items-center overflow-hidden relative group">
                        {product ? (
                          <>
                            <div className="h-20 w-16 shrink-0 rounded-md overflow-hidden bg-muted">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="font-bold text-sm text-foreground truncate">{product.brand}</p>
                              <p className="text-xs text-muted-foreground truncate mb-1">{product.name}</p>
                              <p className="text-[10px] text-primary/80 line-clamp-2 leading-tight"><i>{piece.reason}</i></p>
                            </div>
                            <div className="text-right shrink-0 flex flex-col justify-between h-full py-1">
                              <p className="font-semibold text-sm">{product.currency === 'USD' ? '$' : ''}{product.price}</p>
                              <a 
                                href={product.productUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-2 py-1 rounded-sm uppercase tracking-wider font-bold mt-2 inline-block border border-primary/20"
                              >
                                View Item
                              </a>
                            </div>
                          </>
                        ) : (
                          <div className="flex-1">
                            <p className="font-medium text-sm text-primary">{piece.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{piece.reason}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setResult(null)} className="w-full">
                Design another fusion
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2"
            disabled={selectedCultures.length < 2}
            onClick={handleGenerate}
          >
            <Sparkles className="h-4 w-4" />
            Create Fusion Outfits
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
