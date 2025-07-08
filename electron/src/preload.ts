import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel: string, data: any) => ipcRenderer.send(channel, data),
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => ipcRenderer.on(channel, listener),
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  },
  // Add specific functions for PPTX to PDF conversion
  pptxToPdf: {
    convertPptxToPdf: (pptxPath: string, outputDir?: string) => 
      ipcRenderer.invoke("convert-pptx-to-pdf", pptxPath, outputDir),
    selectPptxFile: () => ipcRenderer.invoke("select-pptx-file"),
    selectOutputDirectory: () => ipcRenderer.invoke("select-output-directory"),
  },
});
