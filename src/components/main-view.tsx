"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  ImageIcon,
} from "lucide-react";
// Next.js Image component removed
import { toast } from "sonner";

type Slide = {
  id: number;
  title: string;
  thumbnail: string;
};

type Props = {
  slides: Slide[];
  currentSlide: number;
  onSlideChange: (slideId: number) => void;
  zoomLevel: number;
  isThumbnailsCollapsed?: boolean;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onSlidesUpdate: (slides: Slide[]) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
};

export default function MainView({
  slides,
  currentSlide,
  onSlideChange,
  zoomLevel,
  isThumbnailsCollapsed = false,
  selectedFile,
  onFileSelect,
  onSlidesUpdate,
  isLoading,
  onLoadingChange,
}: Props) {
  // Local state for conversion process
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [imagePaths, setImagePaths] = useState<string[]>([]);

  // Load slides from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSlides = localStorage.getItem("savedSlides");
        if (savedSlides) {
          const parsedSlides = JSON.parse(savedSlides);
          if (Array.isArray(parsedSlides) && parsedSlides.length > 0) {
            onSlidesUpdate(parsedSlides);
            // If we have slides but no selected file, create a placeholder
            if (!selectedFile) {
              onFileSelect(
                new File([""], "restored-presentation.pptx", {
                  type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                })
              );
            }
            toast.success("Loaded previously saved slides");
          }
        }
      } catch (error) {
        console.error("Error loading slides from localStorage:", error);
      }
    }
  }, []);

  // Watch for changes to selectedFile from external sources (like the header)
  useEffect(() => {
    if (selectedFile && isElectronAvailable) {
      // Check if this is a new file (not our placeholder from localStorage)
      if (
        selectedFile.name !== "restored-presentation.pptx" ||
        selectedFile.size > 0
      ) {
        try {
          const filePath = (selectedFile as any).path;
          if (filePath) {
            // Clear existing slides before starting the conversion process
            onSlidesUpdate([]);
            onLoadingChange(true);
            convertPptxToPdf(filePath);
          }
        } catch (error) {
          console.error("Error processing file from header:", error);
          toast.error("PowerPoint failed to load. Please try again.");
          onLoadingChange(false);
        }
      }
    }
  }, [selectedFile]);

  // Check if window.electron is available (we're in Electron environment)
  const isElectronAvailable = typeof window !== "undefined" && window.electron;

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    if (
      file &&
      file.type ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      onFileSelect(file);
      console.log("File selected:", file.name);

      if (isElectronAvailable) {
        try {
          // Get the file path directly from the file object
          // In Electron, we can use a special property to get the actual path
          const filePath = (file as any).path;

          if (filePath) {
            // Convert the selected file to PDF
            onLoadingChange(true); // Set global loading state
            convertPptxToPdf(filePath);
          } else {
            // If path is not available (which can happen in certain environments),
            // inform the user
            toast.error("Could not access file path. Please try again.");
          }
        } catch (error) {
          console.error("Error processing file:", error);
          toast.error("PowerPoint failed to load. Please try again.");
          onLoadingChange(false); // Reset loading state on error
        }
      }
    }
  };

  const convertPptxToPdf = async (pptxPath: string) => {
    if (!isElectronAvailable) {
      toast.error("Electron API not available");
      onLoadingChange(false);
      return;
    }

    try {
      // toast.info("Converting PowerPoint to PDF...");
      console.log("Converting PowerPoint to PDF...");

      // Get the working files directory path from the main process
      // and convert the PPTX to PDF
      // Use type assertion to avoid TypeScript errors
      const result = await (window.electron as any).pptxToPdf.convertPptxToPdf(
        pptxPath
      );

      if (result.success && result.pdfPath) {
        setPdfPath(result.pdfPath);
        // toast.success("PowerPoint file converted to PDF successfully");
        console.log("PowerPoint file converted to PDF successfully");

        // Check if images were also generated
        if (result.imagePaths && result.imagePaths.length > 0) {
          setImagePaths(result.imagePaths);

          // Create slide objects from the image paths
          const newSlides = result.imagePaths.map(
            (path: string, index: number) => ({
              id: index + 1,
              title: `Slide ${index + 1}`,
              thumbnail: `file://${path}`,
            })
          );

          // Update slides in parent component
          onSlidesUpdate(newSlides);

          // Save slides to localStorage (replacing any previous slides)
          try {
            // Clear any existing slides first
            localStorage.removeItem("savedSlides");
            // Then save the new slides
            localStorage.setItem("savedSlides", JSON.stringify(newSlides));
          } catch (error) {
            console.error("Error saving slides to localStorage:", error);
          }

          toast.success(`PowerPoint loaded successfully`);
          console.log(
            `PDF converted to ${result.imagePaths.length} images successfully`
          );
        } else if (result.imageError) {
          toast.error(`PowerPoint failed to load. Please try again.`);
          console.error(`PDF to image conversion failed: ${result.imageError}`);
          // Reset to file picker state on error
          onFileSelect(null);
        }
      } else {
        toast.error(`PowerPoint failed to load. Please try again.`);
        console.error(`Conversion failed: ${result.error || "Unknown error"}`);
        // Reset to file picker state on error
        onFileSelect(null);
      }
    } catch (error) {
      console.error("Error converting PPTX to PDF:", error);
      toast.error("PowerPoint failed to load. Please try again.");
      // Reset to file picker state on error
      onFileSelect(null);
    } finally {
      onLoadingChange(false); // Reset global loading state
    }
  };

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300`}>
      {selectedFile ? (
        isLoading ? (
          // Loading state while converting files
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
            <Card className="w-full max-w-md p-8 flex flex-col items-center justify-center gap-4 bg-white shadow-sm">
              <div className="rounded-full bg-primary/10 p-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-semibold">Loading Presentation</h2>
              <p className="text-center text-muted-foreground mb-4">
                Please wait while we load your PowerPoint
              </p>
            </Card>
          </div>
        ) : slides.length > 0 ? (
          // Slides view when images are ready
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
                  onClick={() =>
                    onSlideChange(Math.min(slides.length, currentSlide + 1))
                  }
                  disabled={currentSlide === slides.length}
                  className="h-7 w-7 sm:h-8 sm:w-8"
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Separator
                  orientation="vertical"
                  className="h-4 hidden sm:block"
                />
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  {currentSlide} / {slides.length}
                </span>
              </div>
            </div>
            {/* Main Slide View */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
              <div
                className="w-full h-auto max-h-[calc(100vh-200px)] bg-white border overflow-hidden flex items-center justify-center"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  maxWidth: "100%",
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
                  <img
                    src={
                      slides[currentSlide - 1]?.thumbnail ||
                      "/placeholder.svg?height=600&width=800"
                    }
                    alt={`Slide ${currentSlide}`}
                    className="max-w-full max-h-full object-contain"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          // Fallback to file picker if conversion failed
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
            <Card className="w-full max-w-md p-8 flex flex-col items-center justify-center gap-4 bg-white shadow-sm">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Select a PowerPoint</h2>
              <p className="text-center text-muted-foreground mb-4">
                Choose a PPTX file to work with
              </p>
              <div className="w-full">
                <label htmlFor="file-upload" className="cursor-pointer w-full">
                  <div className="flex items-center justify-center w-full border-2 border-dashed border-primary/50 rounded-lg p-6 hover:border-primary transition-colors">
                    <span className="text-primary font-medium">
                      Browse files
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                  </div>
                </label>
              </div>
            </Card>
          </div>
        )
      ) : (
        /* File Picker View */
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <Card className="w-full max-w-md p-8 flex flex-col items-center justify-center gap-4 bg-white shadow-sm">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Select a PowerPoint</h2>
            <p className="text-center text-muted-foreground mb-4">
              Choose a PPTX file to work with
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
                    disabled={isLoading}
                  />
                </div>
              </label>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
