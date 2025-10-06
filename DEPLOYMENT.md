# Deployment Notes

## Vercel Pro Configuration

This app uses **Vercel Blob Storage** to completely bypass serverless function body size limits.

### Architecture

**Blob Upload Flow:**
1. Client uploads file directly to Vercel Blob (bypasses API route body limits)
2. Client receives blob URL
3. Client sends blob URL to transcribe API
4. API downloads file from blob
5. API sends to OpenAI Whisper
6. API deletes blob after transcription

**Benefits:**
- ✅ No 413 errors - uploads go directly to Blob storage
- ✅ Supports full 25MB files (OpenAI Whisper API limit)
- ✅ Automatic cleanup - blobs deleted after use

### Current Settings

- **Max File Size**: 25MB (OpenAI Whisper API limit)
- **Function Timeout**: 60 seconds
- **Runtime**: Node.js
- **Storage**: Vercel Blob (10GB included on Pro plan)

### No More 413 Errors!

If you consistently get `413 Content Too Large` errors with files over ~10MB, you have these options:

#### Option 1: Use Smaller Files
- Compress audio before uploading
- Split longer recordings into segments
- Most WhatsApp voice messages are <5MB and work perfectly

#### Option 2: Alternative Hosting (Recommended for Large Files)

**Railway.app** (Easiest migration):
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Render.com**:
- Free tier supports up to 100MB request bodies
- Create new Web Service
- Connect GitHub repo
- Add `OPENAI_API_KEY` environment variable

**Fly.io**:
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly secrets set OPENAI_API_KEY=sk-...
fly deploy
```

### Environment Variables

Required:
- `OPENAI_API_KEY` - Your OpenAI API key

### Testing Large Files

To test with large files locally:
```bash
npm run dev
# Server runs without Vercel's body size limits
```

## Vercel Pro Features Used

- ✅ 60s function timeout (vs 10s on Hobby)
- ✅ Better performance and reliability
- ✅ Commercial usage allowed

## Cost Estimation

**OpenAI Whisper API**: ~$0.006 per minute of audio
**Vercel Pro**: $20/month

For heavy usage (>100 transcriptions/month with large files), consider:
- Railway Pro: $5-20/month (no body size limits)
- Render: $7/month Starter plan (generous limits)
