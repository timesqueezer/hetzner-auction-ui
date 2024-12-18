import { useState, useEffect } from 'react'
import axios from "axios"
import { Container, Typography } from "@mui/material"

import './App.css'

import ServerTable from "./components/ServerTable"
import FilterBar from "./components/FilterBar"
import AppBar from "./components/AppBar"

import HetznerServer from "./types/HetznerServer"
import ServerFilter from "./types/ServerFilter"


function App() {
  const [servers, setServers] = useState<HetznerServer[]>([])
  const [filteredServers, setFilteredServers] = useState<HetznerServer[]>([])
  const [filters, setFilters] = useState<ServerFilter>({
    cpu: "",
    minRAM: 0,
    maxRAM: 1024,
    maxPrice: Math.max(...servers.map((server) => server.price)),
    minStorage: 0,
    diskType: "",
    minDiskSize: 0,
    minDiskCount: 0,
    maxDiskCount: 0,
    hddMinDiskSize: 0,
    hddMinDiskCount: 0,
    hddMaxDiskCount: 0,
  })

  useEffect(() => {
    console.log("Fetching server data...")
    // Fetch server data
    axios
      .get("https://www.hetzner.com/_resources/app/data/app/live_data_sb_EUR.json")
      .then((response) => {
        setServers(response.data.server)
        setFilteredServers(response.data.server)
      })
      .catch((error) => console.error("Error fetching server data:", error))
  }, [])

  return (
    <Container maxWidth="lg">
      <AppBar />
      <div style={{ marginTop: '2rem' }}>
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          servers={servers}
          setFilteredServers={setFilteredServers}
        />

        <div style={{ marginTop: '2rem' }}>
          <ServerTable servers={filteredServers} />
        </div>
      </div>
    </Container>
  )
}

export default App
