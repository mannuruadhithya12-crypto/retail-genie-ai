'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ChevronLeft, Maximize, RotateCcw, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ARMirror = dynamic(() => import('@/components/ar/ARMirror').then(mod => mod.ARMirror), { ssr: false })

export default function ARPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const modelUrl = searchParams.get('model')
  const imageUrl = searchParams.get('image')
  const productName = searchParams.get('name') || 'Virtual Garment'

  const [useFallback, setUseFallback] = useState(false)
  const [deviceFailed, setDeviceFailed] = useState(false)

  useEffect(() => {
    // Dynamic import for Web Component
    import('@google/model-viewer').catch(console.error)
    
    // Check if device supports MediaPipe Pose via basic camera check
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setDeviceFailed(true)
      setUseFallback(true)
    }
  }, [])

  const garment: any = {
    id: '1',
    name: productName,
    type: 'top',
    modelUrl: modelUrl || '',
    imageUrl: imageUrl || '',
    positionOffset: [0, 0, 0],
    scale: [1, 1, 1],
    attachmentType: 'upper_body'
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      {/* Top Navigation */}
      <div className="absolute top-0 inset-x-0 p-4 z-50 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/20 rounded-full"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-2 h-5 w-5" /> Back to Store
        </Button>
        <div className="flex items-center gap-3">
          <Button 
            variant={"outline"} 
            className={`rounded-full border-white/20 text-xs ${useFallback ? 'bg-primary text-white' : 'bg-black/50'} text-white`}
            onClick={() => setUseFallback(!useFallback)}
          >
            3D Viewer Mode
          </Button>
        </div>
      </div>

      {/* Main AR Canvas */}
      <div className="flex-1 relative">
        {useFallback || (!modelUrl && !imageUrl) ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 border border-white/10 rounded-3xl m-4 pb-8" style={{ height: 'calc(100vh - 2rem)', width: 'calc(100vw - 2rem)' }}>
            <h2 className="text-xl font-headline font-bold mb-4">{productName} - 3D Preview</h2>
            {modelUrl ? (
              // @ts-ignore
              <model-viewer
                src={modelUrl}
                ar
                camera-controls
                auto-rotate
                style={{ width: "100%", height: "80%" }}
                shadow-intensity="1"
                environment-image="neutral"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <p>No 3D Model Available</p>
                {imageUrl && <img src={imageUrl} alt={productName} className="mt-4 max-h-64 rounded-xl shadow-lg border border-white/20" />}
              </div>
            )}
          </div>
        ) : (
           <ARMirror selectedGarments={[garment]} />
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 inset-x-0 p-6 z-50 flex justify-center gap-4 bg-gradient-to-t from-black via-black/80 to-transparent pb-10">
         <Button className="rounded-full w-14 h-14 glass-panel text-white hover:scale-110 transition-transform">
            <RotateCcw className="h-6 w-6" />
         </Button>
         <Button 
            className="rounded-full h-14 px-8 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold tracking-widest uppercase hover:scale-105 transition-transform"
            onClick={() => setUseFallback(false)}
            disabled={useFallback === false}
         >
            <Video className="mr-2 h-5 w-5" /> Live Mirror
         </Button>
         <Button className="rounded-full w-14 h-14 glass-panel text-white hover:scale-110 transition-transform">
            <Maximize className="h-6 w-6" />
         </Button>
      </div>
    </div>
  )
}
