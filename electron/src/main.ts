import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { getPort } from "get-port-please";
import { startServer } from "next/dist/server/lib/start-server";
import { join, dirname, basename, parse } from "path";
import { exec } from "child_process";
import { existsSync, mkdirSync } from "fs";

// Define working files directory
const userDataPath = app.getPath('userData'); // e.g. ~/Library/Application Support/MyApp on macOS
const workingDir = join(userDataPath, 'working-files');

// Create working files directory if it doesn't exist
if (!existsSync(workingDir)) {
  mkdirSync(workingDir, { recursive: true });
}

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
    // If no output directory is provided, use the working files directory
    const finalOutputDir = outputDir || workingDir;
    
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

/**
 * Converts a PDF file to images using ImageMagick's convert command
 * @param pdfPath Path to the PDF file
 * @param outputDir Output directory for the image files (optional)
 * @param density DPI for the output images (default: 150)
 * @param quality Quality of the output images (default: 90)
 * @returns Promise that resolves with an array of paths to the generated image files
 */
const convertPdfToImages = (pdfPath: string, outputDir?: string, density: number = 150, quality: number = 90): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    // If no output directory is provided, use the working files directory
    const finalOutputDir = outputDir || workingDir;
    
    // Create the output directory if it doesn't exist
    if (!existsSync(finalOutputDir)) {
      try {
        mkdirSync(finalOutputDir, { recursive: true });
      } catch (error) {
        reject(`Failed to create output directory: ${error}`);
        return;
      }
    }
    
    // Get the base name of the PDF file without extension
    const { name } = parse(pdfPath);
    
    // Create output filename pattern with 3-digit numbering
    const outputPattern = join(finalOutputDir, `${name}-%03d.jpg`);
    
    // Construct the ImageMagick command (using 'magick' for ImageMagick v7)
    const command = `magick -density ${density} "${pdfPath}" -quality ${quality} "${outputPattern}"`;
    
    console.log(`Executing command: ${command}`);
    
    // Execute the command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error converting PDF to images: ${error.message}`);
        reject(`Failed to convert PDF to images: ${error.message}`);
        return;
      }
      
      if (stderr && !stderr.includes('Processed pages')) {
        console.warn(`ImageMagick warning: ${stderr}`);
      }
      
      // Use a more reliable approach to find the generated files
      // We'll use the find command which handles spaces in filenames better
      const escapedName = name.replace(/(["'$`\\])/g, '\\$1');
      const findCommand = `find "${finalOutputDir}" -type f -name "${escapedName}-*.jpg" | sort`;
      
      console.log(`Finding generated images with command: ${findCommand}`);
      
      exec(findCommand, (findError, findOutput) => {
        if (findError) {
          console.error(`Error finding generated images: ${findError.message}`);
          reject(`Failed to find generated images: ${findError.message}`);
          return;
        }
        
        const imagePaths = findOutput.trim().split('\n').filter(Boolean);
        
        if (imagePaths.length === 0) {
          console.error(`No image files were found after conversion`);
          reject(`No image files were generated. Check if the PDF is valid.`);
          return;
        }
        
        console.log(`Successfully converted ${pdfPath} to ${imagePaths.length} images`);
        resolve(imagePaths);
      });
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
      
      // Automatically convert PDF to images
      try {
        const imagePaths = await convertPdfToImages(pdfPath, outputDir);
        return { success: true, pdfPath, imagePaths };
      } catch (imageError) {
        console.error(`Error converting PDF to images: ${imageError}`);
        // Still return success for PDF conversion even if image conversion fails
        return { success: true, pdfPath, imageError: String(imageError) };
      }
    } catch (error) {
      console.error(`Error in convert-pptx-to-pdf handler: ${error}`);
      return { success: false, error: String(error) };
    }
  });
  
  // Handle PDF to images conversion (separate handler for direct PDF conversion)
  ipcMain.handle("convert-pdf-to-images", async (_, pdfPath: string, outputDir?: string, density?: number, quality?: number) => {
    try {
      const imagePaths = await convertPdfToImages(pdfPath, outputDir, density, quality);
      return { success: true, imagePaths };
    } catch (error) {
      console.error(`Error in convert-pdf-to-images handler: ${error}`);
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
