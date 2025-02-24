import { useEffect, useCallback } from 'react'
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
  console.log('App: Rendering')
  
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
  const [isInitialized, setIsInitialized] = useState(false)
  
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Handle mobile filter visibility
  useEffect(() => {
    console.log('App: Mobile effect - isMobile:', isMobile)
    if (isMobile) {
      setShowFilters(false)
    }
  }, [isMobile])

  // Initialize filters only when servers are first loaded
  useEffect(() => {
    console.log('App: Init effect triggered', { 
      serverCount: servers.length, 
      isInitialized
    })
    
    if (servers.length > 0 && !isInitialized) {
      console.log('App: Calling calculateInitialFilters')
      calculateInitialFilters(servers)
      setIsInitialized(true)
    }
  }, [servers.length, calculateInitialFilters, isInitialized])

  // Separate effect for filter application
  useEffect(() => {
    console.log('App: Filter effect triggered', { 
      serverCount: servers.length,
      isInitialized,
      hasFilters: !!filters
    })
    
    if (servers.length > 0 && isInitialized && filters) {
      console.log('App: Applying filters to servers')
      const filtered = applyFilters(servers)
      console.log('App: Filter result count:', filtered.length)
      setFilteredServers(filtered)
    }
  }, [servers, filters, applyFilters, setFilteredServers, isInitialized])

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
              calcInitialFilters={calculateInitialFilters}
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
