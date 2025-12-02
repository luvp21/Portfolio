"use client"

import { cn } from "@/lib/utils"

interface PixelatedBannerProps {
  isHidden?: boolean
}

export function PixelatedBanner({ isHidden = false }: PixelatedBannerProps) {
  return (
    <div className={cn(
      "fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-300",
      isHidden && "opacity-0"
    )}>
      {/* Pixelated text banner */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-3 md:space-y-4">
          <h1 className="pixelated-text text-4xl md:text-5xl lg:text-4xl text-foreground/10 dark:text-foreground/5 select-none">
            Hi,I'm Luv — A Full Stack web developer.
          </h1>

          {/* Command prompt */}
          <div className="flex flex-col items-center gap-1 mt-2">
            <p className="text-xs md:text-sm text-foreground/20 dark:text-foreground/10 select-none pixelated-text-small">
              Press / for ?
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

