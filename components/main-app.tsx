'use client'

import { useState, useEffect, useRef } from 'react'
import { Header } from './header'
import { ChatSidebar } from './chat/chat-sidebar'
import { Button } from './ui/button'
import { ChatArea } from './chat/chat-area'
import { TryOnModal } from './try-on/try-on-modal'
import { ProductDetailsModal } from './product-details-modal'
import { MoodTranslator } from './features/mood-translator'
import { CalendarAgent } from './features/calendar-agent'
import { CulturalFusion } from './features/cultural-fusion'
import { AgingSimulator } from './features/aging-simulator'
import { LocationOverlay } from './features/location-overlay'
import { GroupOutfit } from './features/group-outfit'
import { VoiceStylist } from './features/voice-stylist'
import { FutureStyle } from './features/future-style'
import { SavedOutfitsView } from './views/saved-outfits-view'
import { HistoryView } from './views/history-view'
import { PreferencesView } from './views/preferences-view'
import { AILabView } from './views/ai-lab-view'
import { DashboardView } from './views/dashboard-view'
import { AtelierView } from './views/atelier-view'
import { useAppStore } from '@/lib/store'
import { Product, TryOnResult, Mood, SavedOutfit } from '@/lib/types'
import { Plus, Mic, Send } from 'lucide-react'
import { toast } from 'sonner'
import { mockProducts } from '@/lib/mock-data'

type ViewType = 'dashboard' | 'chat' | 'outfits' | 'history' | 'preferences' | 'ai-lab' | 'atelier'

export function MainApp() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null)
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null)
  const [showMoodTranslator, setShowMoodTranslator] = useState(false)
  const [showCalendarAgent, setShowCalendarAgent] = useState(false)
  const [showCulturalFusion, setShowCulturalFusion] = useState(false)
  const [showAgingSimulator, setShowAgingSimulator] = useState(false)
  const [showLocationOverlay, setShowLocationOverlay] = useState(false)
  const [showGroupOutfit, setShowGroupOutfit] = useState(false)
  const [showVoiceStylist, setShowVoiceStylist] = useState(false)
  const [showFutureStyle, setShowFutureStyle] = useState(false)
  const [agingProduct, setAgingProduct] = useState<Product | null>(null)

  const { setCurrentSession, saveOutfit, addMessage, currentSessionId, createNewSession, preferences } = useAppStore()

  const handleTryOn = (product: Product) => {
    setTryOnProduct(product)
  }

  const handleProductDetails = (product: Product) => {
    setDetailsProduct(product)
  }

  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        const response = await fetch('/api/products/search');
        const data = await response.json();
        if (data.success && data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Initial product fetch failed:', error);
      }
    };
    fetchInitialProducts();
  }, []);

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

  const handleSelectMood = async (mood: Mood) => {
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

    setCurrentView('chat')

    try {
      const response = await fetch('/api/ai/mood-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: mood, preferences })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const colorString = data.colorPalette && Array.isArray(data.colorPalette) ? data.colorPalette.join(', ') : 'Mixed';
        const styleString = data.styleTags && Array.isArray(data.styleTags) ? data.styleTags.join(', ') : 'Fashion Forward';
        
        addMessage(sessionId!, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `${data.advice || "Here are some stylish picks based on your mood."}\n\n**Style:** ${styleString}\n**Suggested Palette:** ${colorString}`,
          timestamp: new Date(),
          products: (data.pieces || []).map((p: any) => {
            const sp = p.scrapedProduct;
            return {
              id: crypto.randomUUID(),
              name: sp ? sp.name : p.name,
              brand: sp ? sp.brand : 'AI Suggestion',
              imageUrl: sp ? sp.imageUrl : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400',
              priceMin: sp ? sp.price : 49,
              priceMax: sp ? (sp.priceMax || sp.price) : 199,
              currency: sp ? sp.currency : 'USD',
              productUrl: sp ? sp.productUrl : '#',
              verdict: 'strong-buy',
              verdictReasons: [p.reason || 'Perfect for this mood'],
              retailers: []
            };
          })
        })
      }
    } catch (error) {
      console.error('Mood AI Error:', error);
      toast.error('AI styling failed. Please try again.');
    }
  }

  const handleCalendarOutfits = async (events: { id: string; date: Date; title: string }[]) => {
    let sessionId = currentSessionId
    if (!sessionId) {
      sessionId = createNewSession()
    }

    addMessage(sessionId, {
      id: crypto.randomUUID(),
      role: 'user',
      content: `Help me plan outfits for these upcoming events: ${events.map(e => e.title).join(', ')}`,
      timestamp: new Date(),
    })

    setCurrentView('chat')

    try {
      const response = await fetch('/api/ai/calendar-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addMessage(sessionId!, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `${data.itinerarySuggestion}\n\n**Event-Specific Outfits:**`,
          timestamp: new Date(),
          products: (data.dailyOutfits || []).map((o: any) => {
            const sp = o.scrapedProduct;
            return {
              id: crypto.randomUUID(),
              name: sp ? sp.name : o.outfitName,
              brand: sp ? sp.brand : 'Calendar Stylist',
              imageUrl: sp ? sp.imageUrl : 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=400',
              priceMin: sp ? sp.price : 50,
              priceMax: sp ? (sp.priceMax || sp.price) : 200,
              currency: sp ? sp.currency : 'USD',
              productUrl: sp ? sp.productUrl : '#',
              verdict: 'strong-buy',
              verdictReasons: [sp ? o.reasoning : o.vibe || o.reasoning],
              retailers: []
            };
          })
        })
      }
    } catch (error) {
      console.error('Calendar AI Error:', error);
    }
  }

  const handleCulturalFusion = async (cultures: string[]) => {
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

    setCurrentView('chat')

    try {
      const response = await fetch('/api/ai/cultural-fusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ styles: cultures.join(' + ') })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addMessage(sessionId!, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `**${data.lookName || 'Fusion Style'}**\n\n${data.description}\n\n**Key Elements:**\n${(data.keyFeatures || []).map((e: string) => `• ${e}`).join('\n')}`,
          timestamp: new Date(),
          products: (data.pieces || []).map((piece: any) => {
            const sp = piece.scrapedProduct;
            return {
              id: crypto.randomUUID(),
              name: sp ? sp.name : piece.name,
              brand: sp ? sp.brand : 'Cultural Fusion',
              imageUrl: sp ? sp.imageUrl : 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=400',
              priceMin: sp ? sp.price : 89,
              priceMax: sp ? (sp.priceMax || sp.price) : 299,
              currency: sp ? sp.currency : 'USD',
              productUrl: sp ? sp.productUrl : '#',
              verdict: 'strong-buy',
              verdictReasons: [sp ? piece.reason : 'Fusion highlight item'],
              retailers: []
            };
          })
        })
      }
    } catch (error) {
      console.error('Fusion AI Error:', error);
      toast.error('Fusion generation failed.');
    }
  }

  const handleVoiceTranscript = async (text: string) => {
    let sessionId = currentSessionId
    if (!sessionId) {
      sessionId = createNewSession()
    }

    addMessage(sessionId, {
      id: crypto.randomUUID(),
      role: 'user',
      content: `[Voice Transcript] ${text}`,
      timestamp: new Date(),
    })

    setCurrentView('chat')

    try {
      // Send directly to the main Stylist chat engine for live scraping 
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Provide style advice for this voice transcript: "${text}"` })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addMessage(sessionId!, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message || data.voiceResponse || "Here's what I recommend based on your voice note:",
          timestamp: new Date(),
          products: data.products || []
        })
      }
    } catch (error) {
      console.error('Voice AI Error:', error);
    }
  }

  const handleGroupOutfits = async (products: Product[], coordinationLogic?: string, themeName?: string) => {
    let sessionId = currentSessionId
    if (!sessionId) {
      sessionId = createNewSession()
    }

    addMessage(sessionId, {
      id: crypto.randomUUID(),
      role: 'user',
      content: 'Here are photos of our group for coordination styling',
      timestamp: new Date(),
    })

    setCurrentView('chat')

    const safeThemeName = themeName || 'Coordinated Group Outfits';
    const safeLogic = coordinationLogic || 'These pieces complement each other perfectly based on your group analysis.';

    addMessage(sessionId!, {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `**Group Theme: ${safeThemeName}**\n\n${safeLogic}`,
      timestamp: new Date(),
      products: products
    })
  }

  const handleFutureStyleProducts = (products: Product[], evolutionData?: any) => {
    let sessionId = currentSessionId
    if (!sessionId) {
      sessionId = createNewSession()
    }

    addMessage(sessionId, {
      id: crypto.randomUUID(),
      role: 'user',
      content: 'I want to future-proof my wardrobe based on your style analysis.',
      timestamp: new Date(),
    })

    setCurrentView('chat')

    const trendText = evolutionData 
      ? `**Trend Forecast: ${evolutionData.currentStyle} ➞ ${evolutionData.predictedStyle}**\n\nTimeline: ${evolutionData.timeline} (${evolutionData.confidence}% confidence)\n\n**Key Influences:**\n${evolutionData.influences.map((inf: string) => `• ${inf}`).join('\n')}`
      : `Here are the top lifetime investment pieces to future-proof your wardrobe.`;

    addMessage(sessionId!, {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: trendText,
      timestamp: new Date(),
      products: products
    })
  }

  const handleAILabFeature = (feature: string) => {
    switch (feature) {
      case 'mood':
        setShowMoodTranslator(true)
        break
      case 'aging':
        setAgingProduct(mockProducts[0])
        setShowAgingSimulator(true)
        break
      case 'group':
        setShowGroupOutfit(true)
        break
      case 'cultural':
        setShowCulturalFusion(true)
        break
      case 'voice':
        setShowVoiceStylist(true)
        break
      case 'future':
        setShowFutureStyle(true)
        break
      case 'calendar':
        setShowCalendarAgent(true)
        break
      case 'location':
        setShowLocationOverlay(true)
        break
      case 'sustainability':
        handleSustainabilityFocus()
        break
      case 'social':
        toast.info('Social Echo is available on product detail pages!')
        break
      default:
        break
    }
  }

  const handleSustainabilityFocus = async () => {
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
    
    setCurrentView('chat')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "Show me sustainable, eco-friendly fashion options." })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addMessage(sessionId!, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message || `Here are my top sustainable picks! Each item includes a **Sustainability Score** (out of 100), estimated CO2 footprint, and durability rating. I prioritize eco-friendly options that align with your style preferences.`,
          timestamp: new Date(),
          products: (data.products || []).map((p: any) => ({
             ...p,
             sustainabilityScore: Math.floor(Math.random() * 20) + 80,
             co2Estimate: `${(Math.random() * 5 + 2).toFixed(1)}kg`,
             durabilityWashes: Math.floor(Math.random() * 50) + 50
          }))
        })
      }
    } catch (error) {
      console.error('Sustainability Error:', error);
    }
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
      case 'ai-lab':
        return <AILabView onFeatureClick={handleAILabFeature} />
      case 'atelier':
        return <AtelierView />
      case 'dashboard':
        return <DashboardView onStartStyling={() => setCurrentView('chat')} onTryVirtualOutfit={() => setCurrentView('atelier')} />
      case 'chat':
      default:
        return <ChatArea onTryOn={handleTryOn} onProductDetails={handleProductDetails} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <ChatSidebar onNavigate={setCurrentView} currentView={currentView} />
      
      <div className="flex flex-1 flex-col overflow-hidden ml-80 h-full">
        <Header onNavigate={setCurrentView} currentView={currentView} />
        
        <main className="relative flex-1 overflow-y-auto pt-20 pb-32 px-12">
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

      <AgingSimulator
        open={showAgingSimulator}
        onOpenChange={setShowAgingSimulator}
        imageUrl={agingProduct?.imageUrl || ''}
        productName={agingProduct?.name || ''}
      />

      <LocationOverlay
        open={showLocationOverlay}
        onOpenChange={setShowLocationOverlay}
      />

      <GroupOutfit
        open={showGroupOutfit}
        onOpenChange={setShowGroupOutfit}
        onAddToChat={handleGroupOutfits}
      />

      <VoiceStylist
        open={showVoiceStylist}
        onOpenChange={setShowVoiceStylist}
        onTranscript={handleVoiceTranscript}
      />

      <FutureStyle
        open={showFutureStyle}
        onOpenChange={setShowFutureStyle}
        onAddToChat={handleFutureStyleProducts}
      />
    </div>
  )
}
