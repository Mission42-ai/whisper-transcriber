import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 25MB for Whisper API)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 25MB limit' },
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

    // Handle OpenAI specific errors
    const err = error as { error?: { message?: string }; status?: number };
    if (err?.error?.message) {
      return NextResponse.json(
        { error: err.error.message },
        { status: err.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}

// Increase max duration for serverless function (Vercel)
export const maxDuration = 300; // 5 minutes (requires Pro plan or higher)
