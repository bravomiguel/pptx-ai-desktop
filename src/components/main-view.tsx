"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, Upload, FileText, ImageIcon } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

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

  const [isConverting, setIsConverting] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [imagePaths, setImagePaths] = useState<string[]>([]);

  // Check if window.electron is available (we're in Electron environment)
  const isElectronAvailable = typeof window !== 'undefined' && window.electron;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      onFileSelect(file);
      console.log('File selected:', file.name);
      
      if (isElectronAvailable) {
        try {
          // Get the file path directly from the file object
          // In Electron, we can use a special property to get the actual path
          const filePath = (file as any).path;
          
          if (filePath) {
            // Convert the selected file to PDF
            convertPptxToPdf(filePath);
          } else {
            // If path is not available (which can happen in certain environments),
            // inform the user
            toast.error('Could not access file path. Please try again.');
          }
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error('Failed to process PowerPoint file');
        }
      }
    }
  };
  
  const convertPptxToPdf = async (pptxPath: string) => {
    if (!isElectronAvailable) {
      toast.error('Electron API not available');
      return;
    }
    
    try {
      setIsConverting(true);
      toast.info('Converting PowerPoint to PDF...');
      
      // Get the working files directory path from the main process
      // and convert the PPTX to PDF
      // Use type assertion to avoid TypeScript errors
      const result = await (window.electron as any).pptxToPdf.convertPptxToPdf(pptxPath);
      
      if (result.success && result.pdfPath) {
        setPdfPath(result.pdfPath);
        toast.success('PowerPoint file converted to PDF successfully');
        
        // Check if images were also generated
        if (result.imagePaths && result.imagePaths.length > 0) {
          setImagePaths(result.imagePaths);
          toast.success(`PDF converted to ${result.imagePaths.length} images successfully`);
        } else if (result.imageError) {
          toast.error(`PDF to image conversion failed: ${result.imageError}`);
        }
      } else {
        toast.error(`Conversion failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error converting PPTX to PDF:', error);
      toast.error('Failed to convert PowerPoint to PDF');
    } finally {
      setIsConverting(false);
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
                    disabled={isConverting}
                  />
                </div>
              </label>
            </div>
            {isConverting && (
              <div className="mt-4 text-center">
                <div className="animate-pulse text-primary">Converting PowerPoint to PDF...</div>
              </div>
            )}
            {pdfPath && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>PDF saved at: {pdfPath}</span>
              </div>
            )}
            {imagePaths.length > 0 && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="w-4 h-4" />
                <span>{imagePaths.length} images generated</span>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
} 