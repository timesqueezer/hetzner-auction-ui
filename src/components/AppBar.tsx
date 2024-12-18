import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { useColorScheme } from '@mui/material/styles'

export default function ButtonAppBar() {
  const { mode, setMode } = useColorScheme()

  const handleToggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light')
  }

  const buttonIcon = () => {
    return mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />
  }

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
            aria-label="dark mode"
            sx={{ mr: 2 }}
            onClick={handleToggleMode}
          >
            {buttonIcon()}
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
