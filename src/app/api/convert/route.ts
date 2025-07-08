import { NextRequest, NextResponse } from 'next/server';
import { convertPptxToPdf } from '@/lib/convert-pptx-to-pdf';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    // Validate file type and size
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      return NextResponse.json({ success: false, error: 'Only .pptx files are supported.' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be ≤ 10MB.' }, { status: 400 });
    }

    // Save to temp location
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pptx-'));
    const pptxPath = path.join(tempDir, file.name);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(pptxPath, Buffer.from(arrayBuffer));
    const pdfPath = pptxPath.replace(/\.pptx$/, '.pdf');

    // Convert to PDF using utility
    const pdfBuffer = await convertPptxToPdf(pptxPath, pdfPath);

    // Clean up temp files (ignore errors)
    fs.unlink(pptxPath).catch(() => {});
    fs.unlink(pdfPath).catch(() => {});
    fs.rmdir(tempDir).catch(() => {});

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="converted.pdf"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error.' }, { status: 500 });
  }
} 