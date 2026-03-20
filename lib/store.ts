'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  UserPreferences, 
  ChatSession, 
  SavedOutfit, 
  ChatMessage,
  Currency,
  SkinTone,
  BodyType,
  StylePreference,
  ShopFor
} from './types'

interface AppState {
  // User preferences
  preferences: UserPreferences
  updatePreferences: (prefs: Partial<UserPreferences>) => void
  resetPreferences: () => void

  // Chat sessions
  chatSessions: ChatSession[]
  currentSessionId: string | null
  createNewSession: () => string
  setCurrentSession: (id: string) => void
  addMessage: (sessionId: string, message: ChatMessage) => void
  deleteSession: (id: string) => void

  // Saved outfits
  savedOutfits: SavedOutfit[]
  saveOutfit: (outfit: SavedOutfit) => void
  deleteOutfit: (id: string) => void
  updateOutfitNotes: (id: string, notes: string) => void

  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const defaultPreferences: UserPreferences = {
  location: '',
  climate: '',
  currency: 'USD' as Currency,
  skinTone: 'medium' as SkinTone,
  bodyType: 'average' as BodyType,
  stylePreferences: [] as StylePreference[],
  shopFor: 'self' as ShopFor,
  onboardingCompleted: false,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Preferences
      preferences: defaultPreferences,
      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
      resetPreferences: () => set({ preferences: defaultPreferences }),

      // Chat sessions
      chatSessions: [],
      currentSessionId: null,
      createNewSession: () => {
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          chatSessions: [newSession, ...state.chatSessions],
          currentSessionId: newSession.id,
        }))
        return newSession.id
      },
      setCurrentSession: (id) => set({ currentSessionId: id }),
      addMessage: (sessionId, message) =>
        set((state) => ({
          chatSessions: state.chatSessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [...session.messages, message],
                  updatedAt: new Date(),
                  title:
                    session.messages.length === 0 && message.role === 'user'
                      ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                      : session.title,
                }
              : session
          ),
        })),
      deleteSession: (id) =>
        set((state) => ({
          chatSessions: state.chatSessions.filter((s) => s.id !== id),
          currentSessionId:
            state.currentSessionId === id ? null : state.currentSessionId,
        })),

      // Saved outfits
      savedOutfits: [],
      saveOutfit: (outfit) =>
        set((state) => ({
          savedOutfits: [outfit, ...state.savedOutfits],
        })),
      deleteOutfit: (id) =>
        set((state) => ({
          savedOutfits: state.savedOutfits.filter((o) => o.id !== id),
        })),
      updateOutfitNotes: (id, notes) =>
        set((state) => ({
          savedOutfits: state.savedOutfits.map((o) =>
            o.id === id ? { ...o, notes } : o
          ),
        })),

      // UI state
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'retail-genie-storage',
      partialize: (state) => ({
        preferences: state.preferences,
        chatSessions: state.chatSessions,
        savedOutfits: state.savedOutfits,
      }),
    }
  )
)
