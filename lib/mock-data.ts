import type { Product, TryOnResult, Currency } from './types'

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Cashmere Blend Overcoat',
    brand: 'Arket',
    imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop',
    priceMin: 299,
    priceMax: 350,
    currency: 'USD' as Currency,
    verdict: 'strong-buy',
    verdictReasons: ['Perfect for your climate', 'Matches your style preferences', 'Excellent quality'],
    sustainabilityScore: 85,
    co2Estimate: '12.5 kg CO2',
    durabilityWashes: 200,
    reviewSentiment: '92% love the warmth, 8% say runs large',
    retailers: [
      { name: 'Arket', price: 299, url: '#', inStock: true },
      { name: 'SSENSE', price: 320, url: '#', inStock: true },
      { name: 'Nordstrom', price: 350, url: '#', inStock: false },
    ],
  },
  {
    id: '2',
    name: 'Silk Midi Dress',
    brand: 'Reformation',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
    priceMin: 198,
    priceMax: 248,
    currency: 'USD' as Currency,
    verdict: 'strong-buy',
    verdictReasons: ['Flattering silhouette', 'Sustainable brand', 'Versatile styling'],
    sustainabilityScore: 92,
    co2Estimate: '8.2 kg CO2',
    durabilityWashes: 80,
    reviewSentiment: '88% praise the fit, 10% suggest sizing up',
    retailers: [
      { name: 'Reformation', price: 198, url: '#', inStock: true },
      { name: 'Net-a-Porter', price: 228, url: '#', inStock: true },
    ],
  },
  {
    id: '3',
    name: 'Relaxed Wool Trousers',
    brand: 'COS',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop',
    priceMin: 135,
    priceMax: 175,
    currency: 'USD' as Currency,
    verdict: 'consider',
    verdictReasons: ['Great quality', 'May be warm for your climate', 'Classic style'],
    sustainabilityScore: 78,
    co2Estimate: '15.8 kg CO2',
    durabilityWashes: 150,
    reviewSentiment: '82% love breathability, 12% say runs small',
    retailers: [
      { name: 'COS', price: 135, url: '#', inStock: true },
      { name: 'Farfetch', price: 165, url: '#', inStock: true },
      { name: 'Mr Porter', price: 175, url: '#', inStock: true },
    ],
  },
  {
    id: '4',
    name: 'Organic Cotton Tee',
    brand: 'Everlane',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
    priceMin: 35,
    priceMax: 45,
    currency: 'USD' as Currency,
    verdict: 'strong-buy',
    verdictReasons: ['Everyday essential', 'Sustainable materials', 'Great value'],
    sustainabilityScore: 95,
    co2Estimate: '3.2 kg CO2',
    durabilityWashes: 100,
    reviewSentiment: '95% recommend, 3% prefer tighter fit',
    retailers: [
      { name: 'Everlane', price: 35, url: '#', inStock: true },
      { name: 'Amazon', price: 42, url: '#', inStock: true },
    ],
  },
  {
    id: '5',
    name: 'Leather Chelsea Boots',
    brand: 'Common Projects',
    imageUrl: 'https://images.unsplash.com/photo-1542840843-3349799cded6?w=400&h=500&fit=crop',
    priceMin: 525,
    priceMax: 600,
    currency: 'USD' as Currency,
    verdict: 'skip',
    verdictReasons: ['Premium price point', 'May exceed budget', 'Consider alternatives'],
    sustainabilityScore: 65,
    co2Estimate: '28.5 kg CO2',
    durabilityWashes: 500,
    reviewSentiment: '78% love durability, 15% find break-in period long',
    retailers: [
      { name: 'SSENSE', price: 525, url: '#', inStock: true },
      { name: 'Mr Porter', price: 575, url: '#', inStock: true },
      { name: 'Nordstrom', price: 600, url: '#', inStock: false },
    ],
  },
]

export const mockTryOnResult: TryOnResult = {
  id: '1',
  personImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
  garmentImageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop',
  resultImageUrl: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=600&fit=crop',
  fitVerdict: 'Excellent Fit',
  fitReasons: [
    'Shoulder seams align perfectly with your frame',
    'Length falls at an ideal point for your height',
    'Color complements your skin tone beautifully',
  ],
  climateSuitability: 'Perfect for your mild winter climate. Warm enough for 5-15°C temperatures.',
}

export const climateOptions = [
  { value: 'tropical', label: 'Tropical - Hot & Humid' },
  { value: 'dry', label: 'Dry - Hot & Arid' },
  { value: 'mediterranean', label: 'Mediterranean - Warm & Mild' },
  { value: 'temperate', label: 'Temperate - Moderate Seasons' },
  { value: 'continental', label: 'Continental - Hot Summers, Cold Winters' },
  { value: 'polar', label: 'Polar - Very Cold' },
]

export const currencyOptions: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { value: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'BRL', label: 'Brazilian Real', symbol: 'R$' },
  { value: 'KRW', label: 'South Korean Won', symbol: '₩' },
]

export const styleOptions = [
  { value: 'casual', label: 'Casual' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'modest', label: 'Modest' },
  { value: 'formal', label: 'Formal' },
  { value: 'ethnic-fusion', label: 'Ethnic Fusion' },
  { value: 'k-fashion', label: 'K-Fashion' },
  { value: 'sustainable', label: 'Sustainable' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'bohemian', label: 'Bohemian' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'athleisure', label: 'Athleisure' },
]

export const bodyTypeOptions = [
  { value: 'slim', label: 'Slim', icon: '🧍' },
  { value: 'athletic', label: 'Athletic', icon: '💪' },
  { value: 'average', label: 'Average', icon: '👤' },
  { value: 'curvy', label: 'Curvy', icon: '🌊' },
  { value: 'plus-size', label: 'Plus Size', icon: '✨' },
]

export const skinToneOptions = [
  { value: 'very-light', label: 'Very Light', color: '#FFE5D9' },
  { value: 'light', label: 'Light', color: '#FFD4C4' },
  { value: 'medium-light', label: 'Medium Light', color: '#E8C4A8' },
  { value: 'medium', label: 'Medium', color: '#C9A882' },
  { value: 'medium-dark', label: 'Medium Dark', color: '#A67B5B' },
  { value: 'dark', label: 'Dark', color: '#7B5544' },
  { value: 'very-dark', label: 'Very Dark', color: '#4A3728' },
]

export const moodOptions = [
  { value: 'confident', label: 'Confident', description: 'Bold, powerful looks' },
  { value: 'cozy', label: 'Cozy', description: 'Comfortable, warm pieces' },
  { value: 'adventurous', label: 'Adventurous', description: 'Unique, statement pieces' },
  { value: 'romantic', label: 'Romantic', description: 'Soft, feminine styles' },
  { value: 'professional', label: 'Professional', description: 'Polished, work-ready' },
  { value: 'playful', label: 'Playful', description: 'Fun, colorful choices' },
  { value: 'mysterious', label: 'Mysterious', description: 'Dark, elegant pieces' },
  { value: 'relaxed', label: 'Relaxed', description: 'Effortless, casual vibes' },
]

export const aiResponses = {
  welcome: `Welcome to Retail-Genie! I'm your personal AI stylist, here to help you find clothes that fit your body, climate, culture, mood, and budget.

I noticed you prefer **casual** and **sustainable** styles in a **temperate climate**. Let me show you some pieces I think you'll love:`,
  
  moodResponse: (mood: string) => `Based on your **${mood}** mood today, I've curated some pieces that will help you feel exactly that way. These selections consider your body type, skin tone, and the current weather in your area.`,
  
  sustainabilityInfo: `Each item includes a **Sustainability Score** (out of 100), estimated CO2 footprint, and durability rating. I prioritize eco-friendly options that align with your sustainable style preference.`,
  
  tryOnIntro: `I'll generate a virtual try-on for you. This usually takes 15-30 seconds. I'll analyze how the garment fits your body type and whether the colors complement your skin tone.`,
}
