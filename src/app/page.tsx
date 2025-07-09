"use client"

import { useState } from "react"
import Header from "@/components/header"
import ChatSidebar from "@/components/chat-sidebar"
import MainView from "@/components/main-view"
import Thumbnails from "@/components/thumbnails"

type Slide = {
  id: number
  title: string
  thumbnail: string
}

export default function Viewer() {
  const [currentSlide, setCurrentSlide] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isThumbnailsCollapsed, setIsThumbnailsCollapsed] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSlideChange = (slideId: number) => {
    setCurrentSlide(slideId)
  }

  const handleThumbnailsCollapse = (collapsed: boolean) => {
    setIsThumbnailsCollapsed(collapsed)
  }
  
  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file)
    if (!file) {
      setSlides([])
    }
  }
  
  const handleSlidesUpdate = (newSlides: Slide[]) => {
    setSlides(newSlides)
    if (newSlides.length > 0) {
      setCurrentSlide(1)
    }
  }
  
  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header onFileSelect={handleFileSelect} />
      <div className="flex flex-1 min-h-0 overflow-hidden flex-col md:flex-row">
        <ChatSidebar selectedFile={selectedFile} />
        <MainView
          slides={slides}
          currentSlide={currentSlide}
          onSlideChange={handleSlideChange}
          zoomLevel={zoomLevel}
          isThumbnailsCollapsed={isThumbnailsCollapsed}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onSlidesUpdate={handleSlidesUpdate}
          isLoading={isLoading}
          onLoadingChange={handleLoadingChange}
        />
        {(selectedFile && slides.length > 0 && !isLoading) && (
          <Thumbnails
            slides={slides}
            currentSlide={currentSlide}
            onSlideChange={handleSlideChange}
            onCollapseChange={handleThumbnailsCollapse}
            isCollapsed={isThumbnailsCollapsed}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
} 