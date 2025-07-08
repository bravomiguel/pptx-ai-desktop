"use client"

import { useState } from "react"
import Header from "@/components/header"
import ChatSidebar from "@/components/chat-sidebar"
import MainView from "@/components/main-view"
import Thumbnails from "@/components/thumbnails"

const slides = [
  {
    id: 1,
    title: "Paid Searches - Recent Projects For Training",
    thumbnail: "/placeholder.svg?height=120&width=160",
  },
  {
    id: 2,
    title: "Paid Search Content Overview",
    thumbnail: "/placeholder.svg?height=120&width=160",
  },
  {
    id: 3,
    title: "UK Advertising Market Analysis",
    thumbnail: "/placeholder.svg?height=120&width=160",
  },
  {
    id: 4,
    title: "Digital Marketing Overview",
    thumbnail: "/placeholder.svg?height=120&width=160",
  },
  {
    id: 5,
    title: "Brand Paid Search Example",
    thumbnail: "/placeholder.svg?height=120&width=160",
  },
  {
    id: 6,
    title: "Brand Paid Search User Journey",
    thumbnail: "/placeholder.svg?height=120&width=160",
  },
]

export default function Viewer() {
  const [currentSlide, setCurrentSlide] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isThumbnailsCollapsed, setIsThumbnailsCollapsed] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleSlideChange = (slideId: number) => {
    setCurrentSlide(slideId)
  }

  const handleThumbnailsCollapse = (collapsed: boolean) => {
    setIsThumbnailsCollapsed(collapsed)
  }
  
  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
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
        />
        {selectedFile && (
          <Thumbnails
            slides={slides}
            currentSlide={currentSlide}
            onSlideChange={handleSlideChange}
            onCollapseChange={handleThumbnailsCollapse}
            isCollapsed={isThumbnailsCollapsed}
          />
        )}
      </div>
    </div>
  )
} 