'use client'

import { useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessageComponent, TypingIndicator } from './chat-message'
import { ChatInput } from './chat-input'
import { useAppStore } from '@/lib/store'
import { mockProducts, aiResponses } from '@/lib/mock-data'
import type { ChatMessage, Product } from '@/lib/types'

interface ChatAreaProps {
  onTryOn: (product: Product) => void
  onProductDetails: (product: Product) => void
}

export function ChatArea({ onTryOn, onProductDetails }: ChatAreaProps) {
  const {
    chatSessions,
    currentSessionId,
    addMessage,
    createNewSession,
    savedOutfits,
    saveOutfit,
    preferences,
  } = useAppStore()

  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const currentSession = chatSessions.find((s) => s.id === currentSessionId)
  const messages = currentSession?.messages || []

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSaveProduct = (product: Product) => {
    const outfit = {
      id: crypto.randomUUID(),
      name: product.name,
      thumbnailUrl: product.imageUrl,
      products: [product],
      notes: '',
      createdAt: new Date(),
    }
    saveOutfit(outfit)
  }

  const handleSendMessage = async (content: string) => {
    let sessionId = currentSessionId
    if (!sessionId) {
      sessionId = createNewSession()
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    
    // We get the current messages for history before adding the new one
    const sessionHistory = chatSessions.find((s) => s.id === (sessionId || currentSessionId))?.messages || [];
    
    addMessage(sessionId, userMessage)

    setIsTyping(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          messages: sessionHistory,
          preferences,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to generate response')
      }

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
        products: data.products?.length > 0 ? data.products : undefined,
      }
      addMessage(sessionId, aiMessage)
    } catch (error: any) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `**Error:** ${error.message || 'Something went wrong.'}`,
        timestamp: new Date(),
      }
      addMessage(sessionId, errorMessage)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden relative">
      <ScrollArea className="flex-1 min-h-0 p-4" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <h2 className="text-2xl font-semibold">Welcome to Retail-Genie</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                I am your personal AI stylist. Ask me about outfit recommendations, try on clothes virtually, or get styling advice tailored to your preferences.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-4">
                {[
                  'Show me casual outfits',
                  'How do I feel today?',
                  'Sustainable fashion picks',
                  'Office wear suggestions',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSendMessage(suggestion)}
                    className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessageComponent
                key={message.id}
                message={message}
                onTryOn={onTryOn}
                onSave={handleSaveProduct}
                onDetails={onProductDetails}
              />
            ))
          )}
          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      <ChatInput onSend={handleSendMessage} disabled={isTyping} />
    </div>
  )
}
