# Whisper Transcriber

A simple, clean web app for transcribing audio files using OpenAI's Whisper API. Built with Next.js 15, Material UI, and Tailwind CSS.

## Features

- 🎤 **Drag & Drop Upload** - Simple file upload with drag & drop support
- ⚡ **Instant Transcription** - Fast transcription using OpenAI Whisper API
- 📝 **Markdown Export** - Download transcripts as .md files
- 🎨 **Clean UI** - Material UI + Tailwind CSS for a polished look
- 🌐 **Vercel Ready** - Optimized for Vercel deployment

## Supported Audio Formats

- `.opus` (WhatsApp voice messages)
- `.mp3`
- `.wav`
- `.m4a`
- `.ogg`
- `.webm`

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

**Important Notes for Vercel Pro:**
- **File Size**: Configured for up to 25MB (OpenAI Whisper API maximum)
  - Vercel Pro plan recommended for optimal performance with larger files
  - If you encounter 413 errors with large files, this is a Vercel platform limitation
- **Function Timeout**: 60s (configured in vercel.json, works on Pro plan)
- **Alternative**: For files > 10MB or frequent large uploads, consider Railway.app or Render.com for better reliability

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
