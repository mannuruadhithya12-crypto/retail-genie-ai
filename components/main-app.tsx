'use client'

import { useState } from 'react'
import { Header } from './header'
import { ChatSidebar } from './chat/chat-sidebar'
import { ChatArea } from './chat/chat-area'
import { TryOnModal } from './try-on/try-on-modal'
import { ProductDetailsModal } from './product-details-modal'
import { MoodTranslator } from './features/mood-translator'
import { CalendarAgent } from './features/calendar-agent'
import { CulturalFusion } from './features/cultural-fusion'
import { FeatureButtons } from './features/feature-buttons'
import { SavedOutfitsView } from './views/saved-outfits-view'
import { HistoryView } from './views/history-view'
import { PreferencesView } from './views/preferences-view'
import { useAppStore } from '@/lib/store'
import type { Product, TryOnResult, Mood, SavedOutfit } from '@/lib/types'
import { toast } from 'sonner'
import { mockProducts } from '@/lib/mock-data'

type ViewType = 'chat' | 'outfits' | 'history' | 'preferences'

export function MainApp() {
  const [currentView, setCurrentView] = useState<ViewType>('chat')
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null)
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null)
  const [showMoodTranslator, setShowMoodTranslator] = useState(false)
  const [showCalendarAgent, setShowCalendarAgent] = useState(false)
  const [showCulturalFusion, setShowCulturalFusion] = useState(false)

  const { setCurrentSession, saveOutfit, addMessage, currentSessionId, createNewSession } = useAppStore()

  const handleTryOn = (product: Product) => {
    setTryOnProduct(product)
  }

  const handleProductDetails = (product: Product) => {
    setDetailsProduct(product)
  }

  const handleSaveTryOnResult = (result: TryOnResult) => {
    if (tryOnProduct) {
      const outfit: SavedOutfit = {
        id: crypto.randomUUID(),
        name: tryOnProduct.name,
        thumbnailUrl: result.resultImageUrl,
        products: [tryOnProduct],
        tryOnResult: result,
        notes: '',
        createdAt: new Date(),
      }
      saveOutfit(outfit)
    }
  }

  const handleSaveProduct = (product: Product) => {
    const outfit: SavedOutfit = {
      id: crypto.randomUUID(),
      name: product.name,
      thumbnailUrl: product.imageUrl,
      products: [product],
      notes: '',
      createdAt: new Date(),
    }
    saveOutfit(outfit)
    toast.success('Outfit saved!')
  }

  const handleSelectMood = (mood: Mood) => {
    let sessionId = currentSessionId
    if (!sessionId) {
      sessionId = createNewSession()
    }
    
    addMessage(sessionId, {
      id: crypto.randomUUID(),
      role: 'user',
      content: `I'm feeling ${mood} today. What should I wear?`,
      timestamp: new Date(),
    })

    setTimeout(() => {
      addMessage(sessionId!, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Based on your **${mood}** mood, I've curated some pieces that will help you feel exactly that way. These selections consider your body type, skin tone, and the current weather in your area.`,
        timestamp: new Date(),
        products: mockProducts.slice(0, 3),
      })
    }, 1500)

    setCurrentView('chat')
  }

  const handleCalendarOutfits = (events: { id: string; date: Date; title: string }[]) => {
    let sessionId = currentSessionId
    if (!sessionId) {
      sessionId = createNewSession()
    }

    const eventList = events.map((e) => e.title).join(', ')
    
    addMessage(sessionId, {
      id: crypto.randomUUID(),
      role: 'user',
      content: `Help me plan outfits for these upcoming events: ${eventList}`,
      timestamp: new Date(),
    })

    setTimeout(() => {
      addMessage(sessionId!, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I'll help you plan outfits for your ${events.length} upcoming event${events.length !== 1 ? 's' : ''}! Here are some versatile pieces that work across multiple occasions:`,
        timestamp: new Date(),
        products: mockProducts.slice(0, 4),
      })
    }, 1500)

    setCurrentView('chat')
  }

  const handleCulturalFusion = (cultures: string[]) => {
    let sessionId = currentSessionId
    if (!sessionId) {
      sessionId = createNewSession()
    }

    addMessage(sessionId, {
      id: crypto.randomUUID(),
      role: 'user',
      content: `Create a cultural fusion outfit combining ${cultures.join(' and ')} fashion elements`,
      timestamp: new Date(),
    })

    setTimeout(() => {
      addMessage(sessionId!, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `What an exciting fusion concept! Combining **${cultures.join('** and **')}** fashion creates a unique aesthetic. Here are some pieces that blend these cultural influences beautifully:`,
        timestamp: new Date(),
        products: mockProducts.slice(1, 5),
      })
    }, 1500)

    setCurrentView('chat')
  }

  const handleSustainabilityFocus = () => {
    let sessionId = currentSessionId
    if (!sessionId) {
      sessionId = createNewSession()
    }

    addMessage(sessionId, {
      id: crypto.randomUUID(),
      role: 'user',
      content: 'Show me sustainable fashion options',
      timestamp: new Date(),
    })

    setTimeout(() => {
      addMessage(sessionId!, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Here are my top sustainable picks! Each item includes a **Sustainability Score** (out of 100), estimated CO2 footprint, and durability rating. I prioritize eco-friendly options that align with your style preferences.`,
        timestamp: new Date(),
        products: mockProducts.filter((p) => (p.sustainabilityScore || 0) > 75),
      })
    }, 1500)

    setCurrentView('chat')
  }

  const handleSelectSession = (id: string) => {
    setCurrentSession(id)
    setCurrentView('chat')
  }

  const renderContent = () => {
    switch (currentView) {
      case 'outfits':
        return <SavedOutfitsView />
      case 'history':
        return <HistoryView onSelectSession={handleSelectSession} />
      case 'preferences':
        return <PreferencesView />
      case 'chat':
      default:
        return (
          <>
            {/* Feature buttons bar */}
            <div className="absolute top-4 right-4 z-10">
              <FeatureButtons
                onMoodClick={() => setShowMoodTranslator(true)}
                onCalendarClick={() => setShowCalendarAgent(true)}
                onCulturalClick={() => setShowCulturalFusion(true)}
                onSustainabilityClick={handleSustainabilityFocus}
              />
            </div>
            <ChatArea onTryOn={handleTryOn} onProductDetails={handleProductDetails} />
          </>
        )
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar onNavigate={setCurrentView} currentView={currentView} />
        
        <main className="relative flex-1 flex flex-col overflow-hidden">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      <TryOnModal
        open={!!tryOnProduct}
        onOpenChange={(open) => !open && setTryOnProduct(null)}
        product={tryOnProduct}
        onSave={handleSaveTryOnResult}
      />

      <ProductDetailsModal
        open={!!detailsProduct}
        onOpenChange={(open) => !open && setDetailsProduct(null)}
        product={detailsProduct}
        onTryOn={handleTryOn}
        onSave={handleSaveProduct}
      />

      <MoodTranslator
        open={showMoodTranslator}
        onOpenChange={setShowMoodTranslator}
        onSelectMood={handleSelectMood}
      />

      <CalendarAgent
        open={showCalendarAgent}
        onOpenChange={setShowCalendarAgent}
        onGenerateOutfits={handleCalendarOutfits}
      />

      <CulturalFusion
        open={showCulturalFusion}
        onOpenChange={setShowCulturalFusion}
        onGenerate={handleCulturalFusion}
      />
    </div>
  )
}
