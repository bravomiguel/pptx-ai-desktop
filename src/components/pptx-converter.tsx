"use client";

import { useState, useEffect } from "react";

// Import the ElectronAPI type
type ElectronAPI = {
  ipcRenderer: {
    send: (channel: string, data: any) => void;
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>;
  };
  pptxToPdf: {
    convertPptxToPdf: (pptxPath: string, outputDir?: string) => Promise<{
      success: boolean;
      pdfPath?: string;
      error?: string;
    }>;
    selectPptxFile: () => Promise<{
      canceled: boolean;
      filePath?: string;
    }>;
    selectOutputDirectory: () => Promise<{
      canceled: boolean;
      directoryPath?: string;
    }>;
  };
};

interface ConversionResult {
  success: boolean;
  pdfPath?: string;
  error?: string;
}

export function PptxConverter(): JSX.Element {
  const [pptxPath, setPptxPath] = useState<string>("");
  const [outputDir, setOutputDir] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isElectron, setIsElectron] = useState(false);

  // Check if running in Electron
  useEffect(() => {
    if (typeof window !== "undefined" && /Electron/.test(navigator.userAgent)) {
      setIsElectron(true);
    }
  }, []);

  const handleSelectPptxFile = async () => {
    if (!window.electron || !('pptxToPdf' in window.electron)) return;
    
    // Use type assertion to tell TypeScript about the API shape
    const api = window.electron as ElectronAPI;
    const result = await api.pptxToPdf.selectPptxFile();
    if (!result.canceled && result.filePath) {
      setPptxPath(result.filePath);
    }
  };

  const handleSelectOutputDirectory = async () => {
    if (!window.electron || !('pptxToPdf' in window.electron)) return;
    
    // Use type assertion to tell TypeScript about the API shape
    const api = window.electron as ElectronAPI;
    const result = await api.pptxToPdf.selectOutputDirectory();
    if (!result.canceled && result.directoryPath) {
      setOutputDir(result.directoryPath);
    }
  };

  const handleConvert = async () => {
    if (!window.electron || !('pptxToPdf' in window.electron) || !pptxPath) return;
    
    setIsConverting(true);
    setResult(null);
    
    try {
      // Use type assertion to tell TypeScript about the API shape
      const api = window.electron as ElectronAPI;
      const conversionResult = await api.pptxToPdf.convertPptxToPdf(
        pptxPath,
        outputDir || undefined // If empty string, pass undefined to use default
      );
      
      setResult(conversionResult);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsConverting(false);
    }
  };

  if (!isElectron) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-center">
        <p>This feature is only available in the Electron app.</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">PPTX to PDF Converter</h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={pptxPath}
            onChange={(e) => setPptxPath(e.target.value)}
            placeholder="Path to PPTX file"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSelectPptxFile}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={outputDir}
            onChange={(e) => setOutputDir(e.target.value)}
            placeholder="Output directory (optional)"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSelectOutputDirectory}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse
          </button>
        </div>
        
        <button
          onClick={handleConvert}
          disabled={!pptxPath || isConverting}
          className={`w-full py-2 rounded ${
            !pptxPath || isConverting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          } text-white`}
        >
          {isConverting ? "Converting..." : "Convert PPTX to PDF"}
        </button>
        
        {result && (
          <div
            className={`mt-4 p-4 rounded ${
              result.success ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {result.success ? (
              <div>
                <p className="font-semibold text-green-700">Conversion successful!</p>
                <p className="text-sm mt-1">PDF saved to: {result.pdfPath}</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-red-700">Conversion failed</p>
                <p className="text-sm mt-1">{result.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
