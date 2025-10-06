# Whisper Transcriber

A simple, clean web app for transcribing audio files using OpenAI's Whisper API. Built with Next.js 15, Material UI, and Tailwind CSS.

## Features

- 🎤 **Drag & Drop Upload** - Simple file upload with drag & drop support
- ⚡ **Instant Transcription** - Fast transcription using OpenAI Whisper API
- 📝 **Markdown Export** - Download transcripts as .md files
- 🎨 **Clean UI** - Material UI + Tailwind CSS for a polished look
- 🌐 **Vercel Ready** - Optimized for Vercel deployment

## Supported Audio Formats

All OpenAI Whisper API supported formats:

- `.opus` (WhatsApp voice messages - auto-converted to .ogg)
- `.mp3`, `.mp4`, `.mpeg`, `.mpga`
- `.m4a`
- `.wav`
- `.ogg`, `.oga`
- `.webm`
- `.flac`

**Note:** `.opus` files are automatically converted to `.ogg` format (OPUS codec in OGG container) for compatibility with OpenAI Whisper API.

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/mission42-ai/whisper-transcriber.git
cd whisper-transcriber
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Add your OpenAI API key:

```
OPENAI_API_KEY=sk-...
```

Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).

**Note for local development:** Vercel Blob requires `BLOB_READ_WRITE_TOKEN`.
- On Vercel deployment this is **automatically set** - no action needed!
- For local testing, get the token from: Vercel Dashboard → Your Project → Storage → Blob → `.env.local` tab

```bash
# Add to .env.local for local development (optional)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mission42-ai/whisper-transcriber)

1. Click the "Deploy" button above
2. Add your `OPENAI_API_KEY` in the Vercel environment variables
3. Deploy!

**Architecture:**
This app uses **Vercel Blob Storage** to bypass serverless function body size limits:
1. Client uploads file directly to Vercel Blob (no size limit)
2. API receives blob URL and downloads file server-side
3. File is sent to OpenAI Whisper API for transcription
4. Blob is automatically deleted after transcription

**Requirements:**
- **File Size**: Up to 25MB (OpenAI Whisper API maximum)
- **Vercel Blob**: Included in Pro plan (10GB storage)
- **Function Timeout**: 60s (Pro plan)

### Manual Deployment

```bash
npm run build
npm start
```

## Usage

1. **Upload** - Drag & drop or click to select an audio file
2. **Transcribe** - Click the "Transcribe" button
3. **Download** - Export the transcript as a markdown file

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Material UI v7 + Tailwind CSS v4
- **API**: OpenAI Whisper API
- **Language**: TypeScript
- **Deployment**: Vercel

## API Costs

OpenAI Whisper API pricing: ~$0.006 per minute of audio

## License

MIT

## Author

mission42.ai
