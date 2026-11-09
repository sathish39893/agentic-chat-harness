import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 1. If Vercel Blob Token is set, upload directly to Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob');
        const blob = await put(file.name, file, {
          access: 'public',
        });

        return NextResponse.json({
          url: blob.url,
          name: file.name,
          contentType: file.type || 'application/octet-stream',
          size: file.size,
        });
      } catch (err) {
        console.warn('Vercel Blob upload failed, falling back to data URL:', err);
      }
    }

    // 2. Local Fallback: Convert to Base64 Data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'application/octet-stream';
    const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

    return NextResponse.json({
      url: dataUrl,
      name: file.name,
      contentType: mimeType,
      size: file.size,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
