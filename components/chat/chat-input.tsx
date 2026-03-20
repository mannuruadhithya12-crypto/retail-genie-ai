'use client'

import { useState, useRef } from 'react'
import { Send, Mic, Camera, ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import Image from 'next/image'

interface ChatInputProps {
  onSend: (message: string, images?: File[]) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (!message.trim() && images.length === 0) return
    onSend(message.trim(), images.length > 0 ? images : undefined)
    setMessage('')
    setImages([])
    setPreviews([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select image files only')
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB')
        return false
      }
      return true
    })

    if (images.length + validFiles.length > 4) {
      toast.error('Maximum 4 images allowed')
      return
    }

    setImages([...images, ...validFiles])
    
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const handleVoice = () => {
    toast.info('Voice input coming soon!')
  }

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-xl p-4">
      {/* Image previews */}
      {previews.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative shrink-0 group">
              <Image
                src={preview}
                alt={`Upload ${index + 1}`}
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded-lg border border-border"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            aria-label="Upload image"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            aria-label="Take photo"
          >
            <Camera className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleVoice}
            disabled={disabled}
            aria-label="Voice input"
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about styles, outfits, or upload a photo..."
          className="min-h-[52px] max-h-32 resize-none flex-1"
          disabled={disabled}
          rows={1}
        />

        <Button
          onClick={handleSubmit}
          disabled={disabled || (!message.trim() && images.length === 0)}
          size="icon"
          className="h-[52px] w-[52px] shrink-0"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
