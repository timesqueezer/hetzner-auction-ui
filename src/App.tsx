import { useEffect } from 'react'
import { Container, LinearProgress, Box, IconButton, useMediaQuery, useTheme, Typography } from "@mui/material"
import FilterListIcon from '@mui/icons-material/FilterList'
import RefreshIcon from '@mui/icons-material/Refresh'

import ServerTable from "./components/ServerTable"
import FilterBar from "./components/FilterBar"
import AppBar from "./components/AppBar"

import { useFilters } from "./hooks/useFilters"
import { useServerData } from "./hooks/useServerData"
import { useState } from 'react'

function App() {
  const {
    servers,
    filteredServers,
    loading,
    error,
    fetchData,
    setFilteredServers
  } = useServerData()

  const {
    filters,
    initialFilters,
    setFilters,
    applyFilters,
    calculateInitialFilters
  } = useFilters()

  const [showFilters, setShowFilters] = useState(true)
  
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Handle mobile filter visibility
  useEffect(() => {
    if (isMobile) {
      setShowFilters(false)
    }
  }, [isMobile])

  // Initialize filters when servers are loaded
  useEffect(() => {
    if (servers.length > 0) {
      calculateInitialFilters(servers)
    }
  }, [servers, calculateInitialFilters])

  // Apply filters when they change
  useEffect(() => {
    if (servers.length > 0) {
      const filtered = applyFilters(servers)
      setFilteredServers(filtered)
    }
  }, [servers, filters, applyFilters, setFilteredServers])

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar />
      <Container 
        maxWidth="lg" 
        sx={{ 
          flex: 1, 
          py: 2, 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
          <IconButton 
            onClick={() => setShowFilters(!showFilters)}
            sx={{ display: { sm: 'none' } }}
          >
            <FilterListIcon />
          </IconButton>
          {error && (
            <>
              <Typography color="error" sx={{ flex: 1 }}>
                {error}
              </Typography>
              <IconButton onClick={fetchData} color="primary">
                <RefreshIcon />
              </IconButton>
            </>
          )}
        </Box>
        
        <Box sx={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
          <Box 
            sx={{
              width: { xs: '100%', sm: '300px' },
              flexShrink: 0,
              display: { xs: showFilters ? 'block' : 'none', sm: 'block' },
              position: { xs: 'fixed', sm: 'static' },
              top: { xs: '64px', sm: 'auto' },
              left: 0,
              bottom: 0,
              bgcolor: 'background.paper',
              zIndex: { xs: 1200, sm: 1 },
              borderRight: { sm: 1 },
              borderColor: 'divider'
            }}
          >
            <FilterBar
              filters={filters}
              initialFilters={initialFilters}
              setFilters={setFilters}
              servers={servers}
              setFilteredServers={setFilteredServers}
            />
          </Box>
          
          <Box sx={{ 
            flex: 1,
            ml: { sm: 2 },
            display: { xs: showFilters ? 'none' : 'block', sm: 'block' },
            minHeight: 0,
            overflow: 'hidden'
          }}>
            {loading && <LinearProgress />}
            {!loading && !error && filteredServers.length === 0 && (
              <Typography sx={{ p: 2, textAlign: 'center' }}>
                No servers match the current filters
              </Typography>
            )}
            {!loading && !error && filteredServers.length > 0 && (
              <ServerTable servers={filteredServers} />
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default App
