import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme, Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import { experimental_extendTheme as extendTheme } from '@mui/material/styles'
import App from './App.tsx'

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        background: {
          default: '#ffffff',
          paper: '#f5f5f5',
        },
      },
    },
    dark: {
      palette: {
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
      },
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          overflow: hidden;
        }
      `
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
    }
  }
})

// Remove StrictMode temporarily if it causes issues with initialization
createRoot(document.getElementById('root')!).render(
  <CssVarsProvider theme={theme} defaultMode="dark">
    <CssBaseline enableColorScheme />
    <App />
  </CssVarsProvider>,
)
