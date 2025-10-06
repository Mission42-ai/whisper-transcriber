import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
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

    // Download file from Vercel Blob
    console.log('Downloading file from blob:', blobUrl);
    const blobResponse = await fetch(blobUrl);

    if (!blobResponse.ok) {
      throw new Error('Failed to download file from blob storage');
    }

    const arrayBuffer = await blobResponse.arrayBuffer();

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
    try {
      await del(blobUrl);
      console.log('Blob deleted successfully');
    } catch (deleteError) {
      console.error('Failed to delete blob:', deleteError);
      // Continue anyway - transcription was successful
    }

    return NextResponse.json({
      transcript: transcription,
    });
  } catch (error: unknown) {
    console.error('Transcription error:', error);

    // Try to cleanup blob even on error
    if (blobUrl) {
      try {
        await del(blobUrl);
        console.log('Blob deleted after error');
      } catch (deleteError) {
        console.error('Failed to delete blob after error:', deleteError);
      }
    }

    // Handle different error types
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Failed to transcribe audio' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Vercel configuration
export const maxDuration = 60; // 60s on Pro, 10s on Hobby
export const runtime = 'nodejs';
export const preferredRegion = 'auto';
