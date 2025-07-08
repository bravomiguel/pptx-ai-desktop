import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { getPort } from "get-port-please";
import { startServer } from "next/dist/server/lib/start-server";
import { join, dirname, basename } from "path";
import { exec } from "child_process";
import { existsSync, mkdirSync } from "fs";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  mainWindow.on("ready-to-show", () => mainWindow.show());

  const loadURL = async () => {
    if (is.dev) {
      mainWindow.loadURL("http://localhost:3000");
    } else {
      try {
        const port = await startNextJSServer();
        console.log("Next.js server started on port:", port);
        mainWindow.loadURL(`http://localhost:${port}`);
      } catch (error) {
        console.error("Error starting Next.js server:", error);
      }
    }
  };

  loadURL();
  return mainWindow;
};

const startNextJSServer = async () => {
  try {
    const nextJSPort = await getPort({ portRange: [30_011, 50_000] });
    const webDir = join(app.getAppPath(), "app");

    await startServer({
      dir: webDir,
      isDev: false,
      hostname: "localhost",
      port: nextJSPort,
      customServer: true,
      allowRetry: false,
      keepAliveTimeout: 5000,
      minimalMode: true,
    });

    return nextJSPort;
  } catch (error) {
    console.error("Error starting Next.js server:", error);
    throw error;
  }
};

/**
 * Converts a PPTX file to PDF using LibreOffice in headless mode
 * @param pptxPath Path to the PPTX file
 * @param outputDir Output directory for the PDF file (optional)
 * @returns Promise that resolves with the path to the generated PDF file
 */
const convertPptxToPdf = (pptxPath: string, outputDir?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If no output directory is provided, use the same directory as the PPTX file
    const finalOutputDir = outputDir || dirname(pptxPath);
    
    // Create the output directory if it doesn't exist
    if (!existsSync(finalOutputDir)) {
      try {
        mkdirSync(finalOutputDir, { recursive: true });
      } catch (error) {
        reject(`Failed to create output directory: ${error}`);
        return;
      }
    }
    
    // Construct the LibreOffice command
    const command = `soffice --headless --convert-to pdf "${pptxPath}" --outdir "${finalOutputDir}"`;
    
    // Execute the command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error converting PPTX to PDF: ${error.message}`);
        reject(`Failed to convert PPTX to PDF: ${error.message}`);
        return;
      }
      
      if (stderr) {
        console.warn(`LibreOffice warning: ${stderr}`);
      }
      
      // Get the output PDF file path
      const pptxBasename = basename(pptxPath, '.pptx');
      const pdfPath = join(finalOutputDir, `${pptxBasename}.pdf`);
      
      console.log(`Successfully converted ${pptxPath} to ${pdfPath}`);
      resolve(pdfPath);
    });
  });
};

app.whenReady().then(() => {
  createWindow();

  ipcMain.on("ping", () => console.log("pong"));
  
  // Handle PPTX to PDF conversion
  ipcMain.handle("convert-pptx-to-pdf", async (_, pptxPath: string, outputDir?: string) => {
    try {
      const pdfPath = await convertPptxToPdf(pptxPath, outputDir);
      return { success: true, pdfPath };
    } catch (error) {
      console.error(`Error in convert-pptx-to-pdf handler: ${error}`);
      return { success: false, error: String(error) };
    }
  });
  
  // Handle file selection dialog
  ipcMain.handle("select-pptx-file", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "PowerPoint Presentations", extensions: ["pptx"] }]
    });
    
    if (canceled || filePaths.length === 0) {
      return { canceled: true };
    }
    
    return { canceled: false, filePath: filePaths[0] };
  });
  
  // Handle output directory selection dialog
  ipcMain.handle("select-output-directory", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"]
    });
    
    if (canceled || filePaths.length === 0) {
      return { canceled: true };
    }
    
    return { canceled: false, directoryPath: filePaths[0] };
  });
  
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
