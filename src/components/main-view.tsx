"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import Image from "next/image"

type Slide = {
  id: number
  title: string
  thumbnail: string
}

type Props = {
  slides: Slide[]
  currentSlide: number
  onSlideChange: (slideId: number) => void
  zoomLevel: number
  isThumbnailsCollapsed?: boolean
}

export default function MainView({ slides, currentSlide, onSlideChange, zoomLevel, isThumbnailsCollapsed = false }: Props) {
  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300`}>
      {/* Navigation Controls */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSlideChange(Math.max(1, currentSlide - 1))}
            disabled={currentSlide === 1}
            className="h-7 w-7 sm:h-8 sm:w-8"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSlideChange(Math.min(slides.length, currentSlide + 1))}
            disabled={currentSlide === slides.length}
            className="h-7 w-7 sm:h-8 sm:w-8"
          >
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Separator orientation="vertical" className="h-4 hidden sm:block" />
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            {currentSlide} / {slides.length}
          </span>
        </div>
      </div>
      {/* Main Slide View */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        <Card 
          className={`w-full aspect-[16/9] flex items-center justify-center bg-white shadow-none transition-all duration-300`}
        >
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <Image
              src={slides[currentSlide - 1]?.thumbnail || "/placeholder.svg?height=600&width=800"}
              alt={`Slide ${currentSlide}`}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </Card>
      </div>
    </div>
  )
} 