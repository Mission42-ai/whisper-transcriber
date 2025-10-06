import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (OpenAI Whisper API max is 25MB)
    const MAX_SIZE = 25 * 1024 * 1024; // 25MB - OpenAI Whisper API limit
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 25MB limit (OpenAI Whisper API maximum).' },
        { status: 400 }
      );
    }

    // Create a File object for OpenAI
    const audioFile = new File([await file.arrayBuffer()], file.name, {
      type: file.type,
    });

    // Transcribe with OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'de', // German language
      response_format: 'text',
    });

    return NextResponse.json({
      transcript: transcription,
    });
  } catch (error: unknown) {
    console.error('Transcription error:', error);

    // Handle different error types
    if (error instanceof Error) {
      // Check for OpenAI API errors
      const openAIError = error as { status?: number; message?: string };

      return NextResponse.json(
        { error: openAIError.message || 'Failed to transcribe audio' },
        { status: openAIError.status || 500 }
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
