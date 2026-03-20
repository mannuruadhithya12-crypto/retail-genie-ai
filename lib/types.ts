export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CNY' | 'AUD' | 'CAD' | 'BRL' | 'KRW'

export type SkinTone = 'very-light' | 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark' | 'very-dark'

export type BodyType = 'slim' | 'athletic' | 'average' | 'curvy' | 'plus-size'

export type StylePreference = 
  | 'casual' 
  | 'streetwear' 
  | 'modest' 
  | 'formal' 
  | 'ethnic-fusion' 
  | 'k-fashion' 
  | 'sustainable' 
  | 'luxury' 
  | 'minimalist' 
  | 'bohemian' 
  | 'vintage' 
  | 'athleisure'

export type ShopFor = 'self' | 'family' | 'gifts'

export interface UserPreferences {
  location: string
  climate: string
  currency: Currency
  skinTone: SkinTone
  bodyType: BodyType
  stylePreferences: StylePreference[]
  shopFor: ShopFor
  onboardingCompleted: boolean
}

export type VerdictType = 'strong-buy' | 'consider' | 'skip'

export interface Product {
  id: string
  name: string
  brand: string
  imageUrl: string
  priceMin: number
  priceMax: number
  currency: Currency
  verdict: VerdictType
  verdictReasons: string[]
  sustainabilityScore?: number
  co2Estimate?: string
  durabilityWashes?: number
  reviewSentiment?: string
  retailers: Retailer[]
  isNew?: boolean
  price?: number
}

export interface Retailer {
  name: string
  price: number
  url: string
  inStock: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  products?: Product[]
  images?: string[]
  tryOnResult?: TryOnResult
}

export interface TryOnResult {
  id: string
  personImageUrl: string
  garmentImageUrl: string
  resultImageUrl: string
  fitVerdict: string
  fitReasons: string[]
  climateSuitability: string
  backgroundUrl?: string
}

export interface SavedOutfit {
  id: string
  name: string
  thumbnailUrl: string
  products: Product[]
  tryOnResult?: TryOnResult
  notes: string
  createdAt: Date
}

export interface ChatSession {
  id: string
  title: string
  previewImage?: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export type Mood = 
  | 'confident' 
  | 'cozy' 
  | 'adventurous' 
  | 'romantic' 
  | 'professional' 
  | 'playful' 
  | 'mysterious' 
  | 'relaxed'

export interface CalendarEvent {
  id: string
  date: Date
  title: string
  outfitSuggestion?: Product[]
}
