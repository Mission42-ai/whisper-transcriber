'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#8b5cf6',
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans)',
  },
});

export default theme;
