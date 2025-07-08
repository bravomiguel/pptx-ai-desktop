"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, Upload } from "lucide-react"
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
  selectedFile: File | null
  onFileSelect: (file: File | null) => void
}

export default function MainView({ slides, currentSlide, onSlideChange, zoomLevel, isThumbnailsCollapsed = false, selectedFile, onFileSelect }: Props) {

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      onFileSelect(file);
      // Leave follow-up logic empty for now
      console.log('File selected:', file.name);
    }
  };

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300`}>
      {selectedFile ? (
        <>
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
        </>
      ) : (
        /* File Picker View */
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <Card className="w-full max-w-md p-8 flex flex-col items-center justify-center gap-4 bg-white shadow-sm">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Select a PowerPoint File</h2>
            <p className="text-center text-muted-foreground mb-4">
              Choose a PPTX file to view and analyze
            </p>
            <div className="w-full">
              <label htmlFor="file-upload" className="cursor-pointer w-full">
                <div className="flex items-center justify-center w-full border-2 border-dashed border-primary/50 rounded-lg p-6 hover:border-primary transition-colors">
                  <span className="text-primary font-medium">Browse files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </div>
              </label>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
} 