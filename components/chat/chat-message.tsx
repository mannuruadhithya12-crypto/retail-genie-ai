'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { ProductCard } from './product-card'
import type { ChatMessage, Product } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ChatMessageComponentProps {
  message: ChatMessage
  onTryOn: (product: Product) => void
  onSave: (product: Product) => void
  onDetails: (product: Product) => void
}

export function ChatMessageComponent({
  message,
  onTryOn,
  onSave,
  onDetails,
}: ChatMessageComponentProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex flex-col gap-3 max-w-[85%] md:max-w-[75%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Text content */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-card border border-border rounded-bl-md'
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Product recommendations carousel */}
        {message.products && message.products.length > 0 && (
          <div className="w-full">
            <Carousel
              opts={{
                align: 'start',
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {message.products.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="pl-2 md:pl-4 basis-[280px] md:basis-[300px]"
                  >
                    <ProductCard
                      product={product}
                      onTryOn={onTryOn}
                      onSave={onSave}
                      onDetails={onDetails}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4" />
              <CarouselNext className="hidden md:flex -right-4" />
            </Carousel>
          </div>
        )}
      </div>

      {isUser && (
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            U
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  )
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1.5">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            className="w-2 h-2 bg-muted-foreground rounded-full"
          />
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="w-2 h-2 bg-muted-foreground rounded-full"
          />
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            className="w-2 h-2 bg-muted-foreground rounded-full"
          />
        </div>
      </div>
    </motion.div>
  )
}
