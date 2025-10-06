'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setTranscript('');
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.opus', '.mp3', '.wav', '.m4a', '.ogg', '.webm'],
    },
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024, // 25MB - OpenAI Whisper API limit
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 25MB (OpenAI Whisper API limit).');
      } else {
        setError(error?.message || 'File rejected');
      }
    },
  });

  const handleTranscribe = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (!response.ok) {
        let errorMessage = 'Transcription failed';

        if (isJson) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `Server error: ${response.status}`;
          }
        } else {
          const text = await response.text();
          errorMessage = text || `Server error: ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      if (!isJson) {
        throw new Error('Invalid response format from server');
      }

      const data = await response.json();
      setTranscript(data.transcript);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!transcript) return;

    const blob = new Blob([transcript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace(/\.[^/.]+$/, '')}_transcript.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="md" className="min-h-screen py-12">
      <Box className="text-center mb-8">
        <Typography variant="h3" component="h1" className="font-bold mb-2">
          Whisper Transcriber
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload an audio file and get an instant transcription
        </Typography>
      </Box>

      <Paper elevation={3} className="p-8">
        {/* Upload Area */}
        <Box
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon
            className="mx-auto mb-4"
            sx={{ fontSize: 64, color: 'primary.main' }}
          />
          {isDragActive ? (
            <Typography variant="h6">Drop the file here...</Typography>
          ) : (
            <>
              <Typography variant="h6" className="mb-2">
                Drag & drop an audio file here
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to select a file
              </Typography>
              <Typography variant="caption" color="text.secondary" className="mt-2 block">
                Supports: .opus, .mp3, .wav, .m4a, .ogg, .webm (max 25MB)
              </Typography>
            </>
          )}
        </Box>

        {/* File Info */}
        {file && (
          <Box className="mt-6">
            <Alert severity="info" className="mb-4">
              <Typography variant="body2">
                <strong>File:</strong> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            </Alert>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleTranscribe}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            >
              {loading ? 'Transcribing...' : 'Transcribe'}
            </Button>
          </Box>
        )}

        {/* Error */}
        {error && (
          <Alert severity="error" className="mt-6">
            {error}
          </Alert>
        )}

        {/* Transcript */}
        {transcript && (
          <Box className="mt-6">
            <Typography variant="h6" className="mb-3">
              Transcript
            </Typography>
            <Paper
              variant="outlined"
              className="p-4 max-h-96 overflow-y-auto bg-gray-50"
            >
              <Typography
                variant="body1"
                component="pre"
                className="whitespace-pre-wrap font-mono text-sm"
              >
                {transcript}
              </Typography>
            </Paper>

            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={handleDownload}
              startIcon={<DownloadIcon />}
              className="mt-4"
            >
              Download as Markdown
            </Button>
          </Box>
        )}
      </Paper>

      <Box className="text-center mt-8">
        <Typography variant="caption" color="text.secondary">
          Powered by OpenAI Whisper API
        </Typography>
      </Box>
    </Container>
  );
}
