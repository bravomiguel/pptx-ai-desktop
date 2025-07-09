"use client";

import { Button } from "@/components/ui/button";
import { User, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

interface HeaderProps {
  onFileSelect?: (file: File | null) => void;
}

export default function Header({ onFileSelect }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-background">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black text-white rounded flex items-center justify-center text-sm font-bold">
          v0
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onFileSelect && (
          <div>
            <input
              id="header-file-upload"
              name="header-file-upload"
              type="file"
              accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                if (file) {
                  onFileSelect(file);
                }
              }}
            />
            <label htmlFor="header-file-upload">
              <Button variant="ghost" size="icon" asChild>
                <div className="cursor-pointer">
                  <Upload className="w-4 h-4" />
                </div>
              </Button>
            </label>
          </div>
        )}
        <Button variant="ghost" size="icon">
          <User className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
