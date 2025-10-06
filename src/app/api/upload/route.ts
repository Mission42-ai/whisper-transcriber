import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Allow audio file uploads
        return {
          allowedContentTypes: [
            'audio/opus',
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/mp4',
            'audio/m4a',
            'audio/ogg',
            'audio/webm',
            'audio/*',
          ],
          maximumSizeInBytes: 25 * 1024 * 1024, // 25MB
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Blob upload completed:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    );
  }
}
