import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'

export default function ButtonAppBar() {
  const theme = useTheme()
  const [isDarkMode, setIsDarkMode] = useState(theme.palette.mode === 'dark')
  
  const handleToggleMode = () => {
    const mode = isDarkMode ? 'light' : 'dark'
    setIsDarkMode(!isDarkMode)
    document.documentElement.setAttribute('data-theme', mode)
    localStorage.setItem('theme-mode', mode)
  }

  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode')
    if (savedMode) {
      setIsDarkMode(savedMode === 'dark')
      document.documentElement.setAttribute('data-theme', savedMode)
    }
  }, [])

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hetzner Auction UI
          </Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="toggle theme"
            sx={{ mr: 2 }}
            onClick={handleToggleMode}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
