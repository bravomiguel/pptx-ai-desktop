"use client";

import { PptxConverter } from "@/components/pptx-converter";

export default function PptxConverterPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">PPTX to PDF Converter</h1>
      <p className="mb-4">
        Convert PowerPoint presentations to PDF using LibreOffice in headless mode.
      </p>
      <PptxConverter />
    </div>
  );
}
