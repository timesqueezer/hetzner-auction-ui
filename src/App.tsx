import { useState, useEffect } from 'react'
import axios, { AxiosResponse } from "axios"
import { Container, LinearProgress, Box, IconButton, useMediaQuery, useTheme } from "@mui/material"
import FilterListIcon from '@mui/icons-material/FilterList'

import './App.css'

import ServerTable from "./components/ServerTable"
import FilterBar from "./components/FilterBar"
import AppBar from "./components/AppBar"

import HetznerServer from "./types/HetznerServer"
import ServerFilter from "./types/ServerFilter"

interface ServerResponse {
  server: HetznerServer[]
}

function App() {
  const [servers, setServers] = useState<HetznerServer[]>([])
  const [filteredServers, setFilteredServers] = useState<HetznerServer[]>([])
  const [filters, setFilters] = useState<ServerFilter>({} as ServerFilter)
  const [initialFilters, setInitialFilters] = useState<ServerFilter>({} as ServerFilter)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(true)
  
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Auto-hide filters on mobile by default
  useEffect(() => {
    if (isMobile) {
      setShowFilters(false)
    }
  }, [isMobile])

  const calcInitialFilters = (serverList: HetznerServer[]) => {
    return {
      cpu: '',
      maxPrice: Math.max(...serverList.map((server) => server.price)),

      minRAM: 0,
      maxRAM: 1024,

      minNvmeSize: 0,
      maxNvmeSize: Math.max(...serverList.map((server) => Math.max(...server.serverDiskData.nvme))),
      minNvmeCount: 0,
      maxNvmeCount: Math.max(...serverList.map((server) => server.serverDiskData.nvme.length)),

      minSataSize: 0,
      maxSataSize: Math.max(...serverList.map((server) => Math.max(...server.serverDiskData.sata))),
      minSataCount: 0,
      maxSataCount: Math.max(...serverList.map((server) => server.serverDiskData.sata.length)),

      minHddSize: 0,
      maxHddSize: Math.max(...serverList.map((server) => Math.max(...server.serverDiskData.hdd))),
      minHddCount: 0,
      maxHddCount: Math.max(...serverList.map((server) => server.serverDiskData.hdd.length)),
    }
  }

  useEffect(() => {
    if (servers.length === 0) {
      axios
        .get<ServerResponse>("https://www.hetzner.com/_resources/app/data/app/live_data_sb_EUR.json")
        .then((response: AxiosResponse<ServerResponse>) => {
          const serverList = response.data.server

          setServers(serverList)
          setFilteredServers(serverList)

          const tmpInitialFilters: ServerFilter = calcInitialFilters(serverList)
          setInitialFilters(tmpInitialFilters)
          setFilters(tmpInitialFilters)

          setLoading(false)

        })
        .catch((error: Error) => console.error("Error fetching server data:", error))
    }
  }, [servers.length])

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar />
      <Container 
        maxWidth="lg" 
        sx={{ 
          flex: 1, 
          py: 2, 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconButton 
            onClick={() => setShowFilters(!showFilters)}
            sx={{ display: { sm: 'none' } }}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ flex: 1, display: 'flex', position: 'relative' }}>
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
              setInitialFilters={setInitialFilters}
              servers={servers}
              setFilteredServers={setFilteredServers}
              calcInitialFilters={calcInitialFilters}
            />
          </Box>
          
          <Box sx={{ 
            flex: 1,
            ml: { sm: 2 },
            display: { xs: showFilters ? 'none' : 'block', sm: 'block' },
            minHeight: 0
          }}>
            {loading && <LinearProgress />}
            {!loading && <ServerTable servers={filteredServers} />}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default App
