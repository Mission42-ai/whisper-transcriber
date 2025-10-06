import { NextRequest, NextResponse } from 'next/server';
import { del, head } from '@vercel/blob';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  let blobUrl: string | null = null;

  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Parse JSON body with blob URL
    const body = await request.json();
    blobUrl = body.blobUrl;
    const filename = body.filename || 'audio.opus';

    if (!blobUrl) {
      return NextResponse.json(
        { error: 'No blob URL provided' },
        { status: 400 }
      );
    }

    // Verify blob exists and get metadata
    console.log('Verifying blob exists:', blobUrl);
    try {
      const blobMetadata = await head(blobUrl);
      console.log('Blob metadata:', {
        size: blobMetadata.size,
        contentType: blobMetadata.contentType,
        url: blobMetadata.url,
      });
    } catch (headError) {
      console.error('Blob verification failed:', headError);
      throw new Error('Failed to verify blob - file may not exist or permissions issue');
    }

    // Download file from Vercel Blob
    console.log('Downloading file from blob...');
    const blobResponse = await fetch(blobUrl);

    if (!blobResponse.ok) {
      console.error('Blob download failed:', {
        status: blobResponse.status,
        statusText: blobResponse.statusText,
        url: blobUrl,
      });
      throw new Error(`Failed to download file from blob storage (HTTP ${blobResponse.status})`);
    }

    const arrayBuffer = await blobResponse.arrayBuffer();
    console.log(`Downloaded ${arrayBuffer.byteLength} bytes from blob`);

    // Validate file size (OpenAI Whisper API max is 25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (arrayBuffer.byteLength > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 25MB limit (OpenAI Whisper API maximum).' },
        { status: 400 }
      );
    }

    // Handle OPUS files - OpenAI expects .ogg extension for OPUS codec
    // WhatsApp voice messages are OPUS codec in OGG container
    let finalFilename = filename;
    let contentType = blobResponse.headers.get('content-type') || 'audio/mpeg';

    if (filename.toLowerCase().endsWith('.opus')) {
      // Rename .opus to .ogg (same format, different extension)
      finalFilename = filename.replace(/\.opus$/i, '.ogg');
      contentType = 'audio/ogg';
      console.log(`Converting OPUS filename: ${filename} → ${finalFilename}`);
    }

    // Create a File object for OpenAI
    const audioFile = new File([arrayBuffer], finalFilename, {
      type: contentType,
    });

    console.log('Transcribing with Whisper API...', { filename: finalFilename, type: contentType });

    // Transcribe with OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'de', // German language
      response_format: 'text',
    });

    console.log('Transcription completed, cleaning up blob...');

    // Delete blob after successful transcription
    let blobDeleted = false;
    try {
      await del(blobUrl);
      blobDeleted = true;
      console.log('✓ Blob deleted successfully:', blobUrl);
    } catch (deleteError) {
      console.error('✗ Failed to delete blob:', deleteError);
      // Continue anyway - transcription was successful
    }

    return NextResponse.json({
      transcript: transcription,
      blobDeleted,
      message: blobDeleted
        ? 'Transcription complete and file cleaned up'
        : 'Transcription complete (cleanup warning - check logs)',
    });
  } catch (error: unknown) {
    console.error('Transcription error:', error);

    // Try to cleanup blob even on error
    let blobDeletedOnError = false;
    if (blobUrl) {
      try {
        await del(blobUrl);
        blobDeletedOnError = true;
        console.log('✓ Blob deleted after error:', blobUrl);
      } catch (deleteError) {
        console.error('✗ Failed to delete blob after error:', deleteError);
      }
    }

    // Handle different error types
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message || 'Failed to transcribe audio',
          blobDeleted: blobDeletedOnError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        blobDeleted: blobDeletedOnError,
      },
      { status: 500 }
    );
  }
}

// Vercel configuration
export const maxDuration = 60; // 60s on Pro, 10s on Hobby
export const runtime = 'nodejs';
export const preferredRegion = 'auto';
