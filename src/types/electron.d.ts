interface ElectronAPI {
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
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
