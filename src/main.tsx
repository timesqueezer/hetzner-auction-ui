import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles'
import App from './App.tsx'

// Create theme with both light and dark mode
const theme = responsiveFontSizes(createTheme({
  palette: {
    mode: localStorage.getItem('theme-mode') as 'light' | 'dark' || 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: localStorage.getItem('theme-mode') === 'dark' ? '#121212' : '#ffffff',
      paper: localStorage.getItem('theme-mode') === 'dark' ? '#1e1e1e' : '#f5f5f5',
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          overflow: 'hidden',
          transition: 'background-color 0.2s ease'
        }
      }
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          height: '100vh'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 16px'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease'
        }
      }
    }
  }
}))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
)
