import { Moon, Sun, Search, Bell, Sparkles } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onNavigate?: (view: any) => void
  currentView?: string
}

export function Header({ onNavigate, currentView }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="fixed top-0 right-0 z-40 flex h-20 w-[calc(100%-20rem)] items-center justify-between px-12 bg-transparent">
      {/* Centered Navigation */}
      <nav className="flex items-center gap-10 font-headline uppercase text-[10px] tracking-[0.2em] font-bold">
        <button 
          onClick={() => onNavigate?.('dashboard')}
          className={cn(
            "pb-1 transition-colors hover:text-white",
            currentView === 'dashboard' ? "text-secondary border-b border-secondary" : "text-slate-500"
          )}
        >
          Trends
        </button>
        <button 
          onClick={() => onNavigate?.('outfits')}
          className={cn(
            "pb-1 transition-colors hover:text-white",
            currentView === 'outfits' ? "text-secondary border-b border-secondary" : "text-slate-500"
          )}
        >
          Collections
        </button>
        <button 
          onClick={() => onNavigate?.('atelier')}
          className={cn(
            "pb-1 transition-colors hover:text-white",
            currentView === 'atelier' ? "text-secondary border-b border-secondary" : "text-slate-500"
          )}
        >
          Atelier
        </button>
      </nav>

      {/* Search and Profile */}
      <div className="flex items-center gap-8">
        <div className="relative group hidden lg:block">
          <Input 
            className="w-64 h-10 pl-10 pr-4 rounded-full bg-white/5 border-white/10 focus:border-secondary transition-all duration-300 text-xs text-white placeholder:text-slate-500 focus:ring-0"
            placeholder="Search Style Library..."
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-secondary transition-colors" />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white transition-colors w-10 h-10 rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white transition-colors w-10 h-10 rounded-full">
            <Sparkles className="h-5 w-5" />
          </Button>
          <div className="w-9 h-9 rounded-full border border-primary/40 p-0.5 ml-2">
            <Avatar className="h-full w-full">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}
