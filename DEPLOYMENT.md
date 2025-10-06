# Deployment Notes

## Vercel Pro Configuration

This app is optimized for **Vercel Pro** plan with the following configuration:

### Current Settings

- **Max File Size**: 25MB (OpenAI Whisper API limit)
- **Function Timeout**: 60 seconds
- **Runtime**: Node.js

### Known Limitations

Vercel has platform-level request body size limits that **cannot be increased via configuration**:

- Even on Pro plan, very large files (>10-15MB) may occasionally fail with 413 errors
- This is a Vercel infrastructure limitation, not a bug in the application

### If You Experience 413 Errors

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
