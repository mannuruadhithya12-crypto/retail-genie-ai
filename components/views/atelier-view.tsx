'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Video, 
  Maximize, 
  Grid, 
  RefreshCw, 
  Sparkles, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  Check,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import type { Product } from '@/lib/types'
const ARMirror = dynamic(() => import('../ar/ARMirror').then(mod => mod.ARMirror), { ssr: false })
import type { Garment } from '../ar/GarmentLayerManager'
import { useEffect } from 'react'

export function AtelierView() {
  const [isCamerActive, setIsCameraActive] = useState(false)
  const [selectedWardrobeItem, setSelectedWardrobeItem] = useState<string | null>(null)
  const [clothingDb, setClothingDb] = useState<Garment[]>([])
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('/api/clothing')
      .then(res => res.json())
      .then(data => setClothingDb(data))
      .catch(console.error);

    fetch('/api/products/search?q=new arrivals trending')
      .then(res => res.json())
      .then(data => {
        if (data.products) setRecommendedProducts(data.products)
      })
      .catch(console.error);
  }, []);

  const activeGarments = selectedWardrobeItem 
    ? clothingDb.filter(g => g.id === selectedWardrobeItem) 
    : [];

  const wardrobeItems = [
    { id: '1', name: 'Cyber-Denim Shell', brand: 'Nordic Peak', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400' },
    { id: '2', name: 'Isotope Tee', brand: 'Atelier X', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400' },
    { id: '3', name: 'Flux Cargo Denim', brand: 'Genie-Basic', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400' },
    { id: '4', name: 'Velocity V2', brand: 'Step-AI', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400' },
  ]

  return (
    <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-12 gap-8">
        
        {/* Left Column: Virtual Atelier Hero & Preview */}
        <section className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
            <div>
              <h2 className="text-4xl font-headline font-bold tracking-tight text-white">Virtual Atelier</h2>
              <p className="text-slate-400 text-sm mt-2 font-medium tracking-wide">Precision AR Fitting powered by Genie-AI v4.0</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-full bg-white/5 border-white/10 text-xs font-headline uppercase tracking-widest h-11 px-6 hover:bg-white/10">
                <Upload className="mr-2 h-4 w-4" /> Upload Photo
              </Button>
              <Button onClick={() => setIsCameraActive(!isCamerActive)} className="rounded-full bg-gradient-to-r from-primary to-primary-container text-white text-xs font-headline font-bold uppercase tracking-widest h-11 px-6 shadow-[0_0_20px_rgba(219,144,255,0.3)]">
                <Video className="mr-2 h-4 w-4" /> {isCamerActive ? 'Stop Camera' : 'Start Camera'}
              </Button>
            </div>
          </div>

          {/* Main Camera Preview Box */}
          <div className={`relative ${isCamerActive ? 'h-[80vh]' : 'aspect-[4/3]'} w-full rounded-3xl overflow-hidden bg-slate-900 border border-white/5 group shadow-2xl`}>
            {isCamerActive ? (
              <ARMirror selectedGarments={activeGarments} />
            ) : (
              <>
                <Image 
                  src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1200" 
                  alt="Virtual Try-On Model"
                  fill
                  className="object-cover opacity-60 grayscale-[0.2]"
                />
                
                {/* AR UI Elements Overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-start">
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-panel p-4 rounded-2xl border border-white/10 pointer-events-auto shadow-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#5f9eff]"></div>
                        <span className="text-[10px] font-headline tracking-widest text-secondary font-bold uppercase">Live Body Mapping</span>
                      </div>
                      <div className="mt-2 space-y-1.5">
                        <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: "75%" }}
                            className="h-full bg-secondary shadow-[0_0_8px_#5f9eff]"
                          />
                        </div>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Stability: 98.4%</p>
                      </div>
                    </motion.div>

                    <div className="flex flex-col gap-3 pointer-events-auto">
                      <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-slate-300 hover:text-primary transition-all hover:scale-110 border border-white/10">
                        <Maximize className="h-4 w-4" />
                      </button>
                      <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-slate-300 hover:text-primary transition-all hover:scale-110 border border-white/10">
                        <Grid className="h-4 w-4" />
                      </button>
                      <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-slate-300 hover:text-primary transition-all hover:scale-110 border border-white/10">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Scan Line Animation */}
                  <div className="scan-line opacity-30"></div>

                  <div className="flex justify-center items-center pointer-events-auto">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsCameraActive(true)}
                      className="flex flex-col items-center gap-3 group"
                    >
                      <div className="w-20 h-20 rounded-full glass-panel border-4 border-primary flex items-center justify-center text-primary shadow-[0_0_30px_rgba(219,144,255,0.4)] cursor-pointer">
                        <Sparkles className="h-10 w-10 fill-primary/10" />
                      </div>
                      <span className="text-[10px] font-headline tracking-widest uppercase font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                        Try Outfit
                      </span>
                    </motion.button>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="glass-panel p-4 rounded-2xl border border-white/10 shadow-xl">
                      <p className="text-[8px] text-slate-400 uppercase tracking-widest font-bold mb-1">Detected Form</p>
                      <p className="text-sm font-headline font-bold text-white tracking-tight">ATHLETIC - SIZE M</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 glass-panel rounded-full text-[10px] tracking-widest uppercase font-bold text-white border border-white/10">4K Live</span>
                      <span className="px-3 py-1 glass-panel rounded-full text-[10px] tracking-widest uppercase font-bold text-tertiary border border-tertiary/30">Real-time RT</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Right Column: Wardrobe Sidebar */}
        <section className="col-span-12 lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold text-white">Your Wardrobe</h3>
            <button className="text-[10px] font-headline tracking-widest uppercase text-secondary font-bold hover:underline">View All</button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {wardrobeItems.map((item) => (
              <motion.div 
                key={item.id}
                whileHover={{ y: -4 }}
                className="group cursor-pointer active:scale-95 transition-all"
                onClick={() => setSelectedWardrobeItem(item.id)}
              >
                <div className={cn(
                  "aspect-square rounded-2xl bg-slate-900 overflow-hidden border transition-all relative mb-3",
                  selectedWardrobeItem === item.id ? "border-primary shadow-[0_0_15px_rgba(219,144,255,0.2)]" : "border-white/5 group-hover:border-white/20"
                )}>
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] font-headline uppercase tracking-widest text-slate-500 font-bold mb-0.5">{item.brand}</p>
                <p className="text-sm font-bold text-white truncate">{item.name}</p>
              </motion.div>
            ))}
          </div>

          {/* AI Accessory Tray */}
          <div className="p-6 rounded-3xl glass-morphism border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl -mr-16 -mt-16"></div>
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-5 w-5 text-secondary" />
              <h4 className="font-headline font-bold text-sm tracking-tight text-white">AI Accessory Suggestion</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Based on your outfit silhouette, the <span className="text-secondary font-bold">Prism Shades</span> would complete this avant-garde look.
            </p>
            <Button className="w-full py-2.5 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-headline font-bold tracking-widest uppercase hover:bg-secondary/20 transition-all">
              Apply Selection
            </Button>
          </div>
        </section>

        {/* Bottom Section: Recommendations Tray */}
        <section className="col-span-12 space-y-6 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline text-3xl font-bold text-white">Curated for You</h3>
              <p className="text-slate-400 text-sm mt-1">Similar styles from the FW24 Digital Drop</p>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:bg-white/5">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:bg-white/5">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-6 pb-6 hide-scrollbar">
            {recommendedProducts.map((product) => (
              <div key={product.id} className="min-w-[300px] group">
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-4 border border-white/5 group-hover:border-primary/30 transition-all duration-500">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  
                  {product.isNew && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-headline font-bold uppercase tracking-widest shadow-lg">New Drop</span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/10 py-2 rounded-xl text-[10px] font-headline font-bold uppercase tracking-widest text-white hover:bg-white/20">
                        Try AR
                      </Button>
                      <Button className="bg-primary border-none py-2 rounded-xl text-on-primary text-[10px] font-headline font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform">
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-start px-1">
                  <div>
                    <h5 className="font-headline font-bold text-lg text-white group-hover:text-primary transition-colors">{product.name}</h5>
                    <p className="text-slate-500 text-xs font-headline tracking-widest uppercase font-bold">{product.brand}</p>
                  </div>
                  <p className="font-headline font-bold text-secondary text-lg">${product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
