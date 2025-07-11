"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
// Next.js Image component removed

type Slide = {
  id: number;
  title: string;
  thumbnail: string;
};

type Props = {
  slides: Slide[];
  currentSlide: number;
  onSlideChange: (slideId: number) => void;
  onCollapseChange: (collapsed: boolean) => void;
  isCollapsed: boolean;
  isLoading?: boolean;
};

export default function Thumbnails({
  slides,
  currentSlide,
  onSlideChange,
  onCollapseChange,
  isCollapsed,
  isLoading = false,
}: Props) {
  return (
    <div
      className={`h-full bg-background flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-10" : "w-full md:w-48"
      }`}
    >
      <div className="flex items-center justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 my-1"
          onClick={() => onCollapseChange(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <ScrollArea className="flex-1 h-full">
          <div className="p-2 space-y-2 mr-2">
            {slides.map((slide) => (
              <Card
                key={slide.id}
                className={`cursor-pointer transition-all shadow-none overflow-hidden rounded-lg ${
                  currentSlide === slide.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:ring-2 hover:ring-primary/50"
                }`}
                onClick={() => onSlideChange(slide.id)}
              >
                <div className="w-auto h-auto overflow-hidden">
                  <img
                    src={slide.thumbnail || "/placeholder.svg"}
                    alt={`Slide ${slide.id} thumbnail`}
                    className="w-auto h-auto object-cover"
                  />
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {isCollapsed && (
        <div className="flex flex-col items-center pt-2 gap-1">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className={`h-2 w-2 rounded-full my-1 cursor-pointer ${
                currentSlide === slide.id
                  ? "bg-primary"
                  : "bg-muted-foreground/30"
              }`}
              onClick={() => onSlideChange(slide.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
