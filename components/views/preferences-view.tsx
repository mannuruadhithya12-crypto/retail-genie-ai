'use client'

import { useState } from 'react'
import { MapPin, Palette, User, ShoppingBag, Plus, Check, ChevronDown, Globe, CreditCard, Save, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Currency, SkinTone, BodyType, StylePreference, ShopFor } from '@/lib/types'

const skinToneOptions: { value: SkinTone; color: string }[] = [
  { value: 'very-light', color: '#F9E4D4' },
  { value: 'light', color: '#F2CBB0' },
  { value: 'medium-light', color: '#DCAE91' },
  { value: 'medium', color: '#BB8D6A' },
  { value: 'medium-dark', color: '#8D5B3F' },
  { value: 'dark', color: '#603D2A' },
  { value: 'very-dark', color: '#3C2415' },
]

const styleOptions: { value: StylePreference; label: string }[] = [
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'vintage', label: 'Vintage 90s' },
  { value: 'athleisure', label: 'Athleisure' },
  { value: 'bohemian', label: 'Bohemian Luxe' },
  { value: 'sustainable', label: 'Sustainable' },
  { value: 'k-fashion', label: 'K-Fashion' },
  { value: 'ethnic-fusion', label: 'Ethnic Fusion' },
  { value: 'modest', label: 'Modest' },
]

const bodyTypeOptions: { value: BodyType; label: string; image: string }[] = [
  { value: 'slim', label: 'Slim', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCU3y6CxtDOV1kA5xJRZBUNWXJQOJsoa1l59n1N5FSrRxcTaxvwepeuToWkohllkQbc4HAWisc0v4VgFSvMCIunBKhrx2L4xXy7LlfxAfyF7S-NVK-OZZGeydDiBio-gx-F8MEMa_Su0t3hpsxHCwyjEf9A38I1gp2H5w5QK9inY1XjKegLgaCxm_b68pFa3CmN_Ne_q35lLTlmINHl7fBi9bx6Q9PqMNapFhQZ52gd-1Ti5AJSEN5t_hqeAWc7erT9fggR1HUvy0' },
  { value: 'athletic', label: 'Athletic', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA59fY1PjZLy7tDAX1deJq-8knFRsV1FqIo0PND7mQ1UihFVaCC4pouALMbIEktAqDc7Blu1Zfi2LDK7JnEUoIUUt4jYcIIfMqsDDsxmtejQlCpSH-ke4Itq48zbAScGlju98wE2QrGDuaKutQKVnwK9ACfNHuVOLB4Ig_rJ2Xe_JchKCe9vhOZ1y4ZbsYOiPOBpl0lvO5BBnatb2Ubxyw-pvwrLRxS7OjleM2X1nreAH4TUIlHNvutwDpbtcRBVGn1oy1IRvAXee8' },
  { value: 'average', label: 'Average', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxryGanFnrW6aWYWv_bUi3U7cr7kA2Gxw4qCh1KGQMM57KZ1nw1LRpWZbv1h7uk9UC9OfL-Dw8CGbTcYjEHg1FE5r_CtS2R4wx8QYPd0Dk68PPEF3vWGkDKVsUbUNq0hUVKoGNACtzw0FyJBkAQwR0pygDZbI1GjvpDputuRo0yIDXG9MLB7RqRxF95MnLOC5dn5VIfwIac7_9b3eAf9V9CmXkHOd1GvrIT5irR2zIPdmLctm6Yl7uDYWHefSGLLLOUOVqVOYCWXs' },
  { value: 'curvy', label: 'Curvy', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSMhVxYCvtMZgkLANs_x42NjTdFYKA5egWhtY9lkTOscq5Cx55Y0yILsXWd_ulXMxu5EpPOM0fyVvaFx76JGmJD0TFuxV-rgt-pdGZtTNgqhvG_w5HvUceDZr9cIvJltusKtTbVqc7UQQaM6ljEqmq0IECIrRIu8kg7fExVKKL_3mEk-AiwqJLjsLmhEUfZyh3OF3j6J2TOw0MULxDdiIuPowuQTk6DSDYtmo6Wcd3-PbERdZA8KtW3IzRzhJclJGcIGV26-lDFws' },
  { value: 'plus-size', label: 'Plus Size', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSMhVxYCvtMZgkLANs_x42NjTdFYKA5egWhtY9lkTOscq5Cx55Y0yILsXWd_ulXMxu5EpPOM0fyVvaFx76JGmJD0TFuxV-rgt-pdGZtTNgqhvG_w5HvUceDZr9cIvJltusKtTbVqc7UQQaM6ljEqmq0IECIrRIu8kg7fExVKKL_3mEk-AiwqJLjsLmhEUfZyh3OF3j6J2TOw0MULxDdiIuPowuQTk6DSDYtmo6Wcd3-PbERdZA8KtW3IzRzhJclJGcIGV26-lDFws' },
]

const shopForOptions: { value: ShopFor; label: string }[] = [
  { value: 'self', label: 'Myself' },
  { value: 'family', label: 'Family' },
  { value: 'gifts', label: 'Gifts' },
]

const climateOptions = [
  'Temperate Maritime',
  'Tropical Wet',
  'Arid / Desert',
  'Continental Cold',
  'Mediterranean',
  'Subtropical',
]

const currencyOptions: Currency[] = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD']

type SaveStatus = 'idle' | 'saving' | 'saved'

export function PreferencesView() {
  const { preferences, updatePreferences } = useAppStore()
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  const toggleStyle = (style: StylePreference) => {
    const current = preferences.stylePreferences
    const updated = current.includes(style)
      ? current.filter((s) => s !== style)
      : [...current, style]
    updatePreferences({ stylePreferences: updated })
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })
    } catch {
      // Preferences are already persisted locally via Zustand
    } finally {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    }
  }

  return (
    <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-12 flex items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-headline font-bold tracking-tight text-white mb-4">Preferences</h2>
          <p className="text-slate-400 max-w-xl text-lg">
            Refine your digital style DNA. These parameters guide the AI Stylist to curate your unique wardrobe.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="rounded-full px-8 h-12 font-headline font-bold uppercase tracking-widest text-xs transition-all bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_20px_rgba(219,144,255,0.35)] hover:scale-105 disabled:opacity-70"
          >
            {saveStatus === 'saving' ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : saveStatus === 'saved' ? (
              <><CheckCircle2 className="mr-2 h-4 w-4 text-green-300" />Saved!</>
            ) : (
              <><Save className="mr-2 h-4 w-4" />Save Profile</>
            )}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-12">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-7 space-y-16">

          {/* Location & Climate */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <MapPin className="h-6 w-6 text-secondary" />
              <h3 className="text-xl font-headline font-semibold text-white">Location & Climate</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="space-y-3">
                <Label className="text-[10px] font-headline uppercase tracking-[0.2em] text-slate-500 ml-1">City or Region</Label>
                <div className="relative group">
                  <Input
                    value={preferences.location}
                    onChange={(e) => updatePreferences({ location: e.target.value })}
                    className="w-full bg-transparent border-0 border-b-2 border-white/10 rounded-none focus:border-secondary transition-all px-0 py-3 text-white placeholder:text-slate-600 focus:ring-0 h-auto text-base"
                    placeholder="e.g. Mumbai, India"
                  />
                  <Globe className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-secondary transition-colors" />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-headline uppercase tracking-[0.2em] text-slate-500 ml-1">Climate Type</Label>
                <div className="relative">
                  <select
                    value={preferences.climate}
                    onChange={(e) => updatePreferences({ climate: e.target.value })}
                    className="w-full bg-transparent border-0 border-b-2 border-white/10 rounded-none focus:border-secondary transition-all px-0 py-4 text-white focus:ring-0 appearance-none text-base cursor-pointer"
                  >
                    <option className="bg-slate-900" value="">Select Climate...</option>
                    {climateOptions.map(c => (
                      <option key={c} className="bg-slate-900" value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* Skin Tone Selector */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Palette className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-headline font-semibold text-white">Skin Tone</h3>
            </div>
            <div className="flex flex-wrap gap-5 p-8 rounded-3xl bg-white/5 border border-white/10">
              {skinToneOptions.map((tone) => (
                <button
                  key={tone.value}
                  type="button"
                  onClick={() => updatePreferences({ skinTone: tone.value })}
                  aria-label={tone.value}
                  className={cn(
                    "w-12 h-12 rounded-full border-2 transition-all duration-300 hover:scale-110 shadow-lg relative",
                    preferences.skinTone === tone.value
                      ? "border-primary ring-4 ring-primary/20 scale-110"
                      : "border-transparent hover:border-white/30"
                  )}
                  style={{ backgroundColor: tone.color }}
                >
                  {preferences.skinTone === tone.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-5 w-5 text-black/50" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Style DNA Chips */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Plus className="h-6 w-6 text-tertiary" />
              <h3 className="text-xl font-headline font-semibold text-white">Style DNA</h3>
              <span className="text-xs text-slate-500 ml-auto">Select all that apply</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {styleOptions.map((style) => {
                const isSelected = preferences.stylePreferences.includes(style.value)
                return (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => toggleStyle(style.value)}
                    className={cn(
                      "px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 active:scale-95 border text-sm",
                      isSelected
                        ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_20px_rgba(219,144,255,0.2)]"
                        : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {isSelected && <Check className="inline h-3 w-3 mr-1.5 -mt-0.5" />}
                    {style.label}
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-5 space-y-16">

          {/* Body Architecture */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <User className="h-6 w-6 text-secondary" />
              <h3 className="text-xl font-headline font-semibold text-white">Body Architecture</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {bodyTypeOptions.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => updatePreferences({ bodyType: type.value })}
                  className={cn(
                    "p-4 rounded-3xl transition-all duration-300 group cursor-pointer border flex flex-col items-center",
                    preferences.bodyType === type.value
                      ? "bg-secondary/10 border-secondary shadow-[0_0_20px_rgba(95,158,255,0.1)]"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30"
                  )}
                >
                  <div className="h-32 w-full rounded-2xl bg-white/5 mb-4 flex items-center justify-center overflow-hidden">
                    <img
                      alt={type.label}
                      className={cn(
                        "w-full h-full object-cover transition-opacity duration-300",
                        preferences.bodyType === type.value ? "opacity-100" : "opacity-40 group-hover:opacity-80"
                      )}
                      src={type.image}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {preferences.bodyType === type.value && (
                      <div className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                    )}
                    <p className={cn(
                      "font-headline font-medium text-sm transition-colors",
                      preferences.bodyType === type.value ? "text-secondary" : "text-slate-400 group-hover:text-white"
                    )}>
                      {type.label}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Shopping For */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-headline font-semibold text-white">Shopping For</h3>
            </div>
            <div className="space-y-3">
              {shopForOptions.map((option) => {
                const isSelected = preferences.shopFor === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updatePreferences({ shopFor: option.value })}
                    className={cn(
                      "w-full flex items-center gap-4 p-5 rounded-3xl border cursor-pointer transition-all duration-300 text-left",
                      isSelected
                        ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(219,144,255,0.1)]"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                      isSelected ? "border-primary" : "border-slate-600"
                    )}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className={cn(
                      "font-headline font-medium transition-colors",
                      isSelected ? "text-white" : "text-slate-400"
                    )}>
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Currency Selection */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <CreditCard className="h-6 w-6 text-secondary" />
              <h3 className="text-xl font-headline font-semibold text-white">Currency</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {currencyOptions.map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => updatePreferences({ currency: curr })}
                  className={cn(
                    "flex-1 min-w-[70px] py-4 px-4 rounded-2xl font-bold font-headline transition-all duration-300 border text-sm",
                    preferences.currency === curr
                      ? "bg-white/10 border-secondary text-secondary shadow-[0_0_20px_rgba(95,158,255,0.15)] scale-105"
                      : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10 hover:text-white hover:border-white/30"
                  )}
                >
                  {curr}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
