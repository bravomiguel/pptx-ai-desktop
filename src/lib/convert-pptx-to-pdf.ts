import { promises as fs } from 'fs';
import { spawn } from 'child_process';

/**
 * Converts a PPTX file to PDF using LibreOffice.
 * @param pptxPath Path to the input PPTX file
 * @param pdfPath Path to the output PDF file
 * @returns Buffer of the generated PDF
 */
export async function convertPptxToPdf(pptxPath: string, pdfPath: string): Promise<Buffer> {
  await new Promise<void>((resolve, reject) => {
    const soffice = spawn('soffice', [
      '--headless',
      '--convert-to', 'pdf',
      '--outdir', require('path').dirname(pdfPath),
      pptxPath,
    ]);
    soffice.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error('LibreOffice conversion failed.'));
    });
    soffice.on('error', reject);
  });
  return fs.readFile(pdfPath);
} 