import { useState, useEffect } from 'react'
import axios from "axios"
import { Container, LinearProgress } from "@mui/material"

import './App.css'

import ServerTable from "./components/ServerTable"
import FilterBar from "./components/FilterBar"
import AppBar from "./components/AppBar"

import HetznerServer from "./types/HetznerServer"
import ServerFilter from "./types/ServerFilter"


function App() {
  const [servers, setServers] = useState<HetznerServer[]>([])
  const [filteredServers, setFilteredServers] = useState<HetznerServer[]>([])
  const [filters, setFilters] = useState<ServerFilter>({} as ServerFilter)
  const [initialFilters, setInitialFilters] = useState<ServerFilter>({} as ServerFilter)
  const [loading, setLoading] = useState(true)

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
        .get("https://www.hetzner.com/_resources/app/data/app/live_data_sb_EUR.json")
        .then((response) => {
          const serverList: HetznerServer[] = response.data.server

          setServers(serverList)
          setFilteredServers(serverList)

          const tmpInitialFilters: ServerFilter = calcInitialFilters(serverList)
          setInitialFilters(tmpInitialFilters)
          setFilters(tmpInitialFilters)

          setLoading(false)

        })
        .catch((error) => console.error("Error fetching server data:", error))
    }
  }, [servers.length])

  return (
    <Container maxWidth="lg">
      <AppBar />
      <div style={{ marginTop: '2rem' }}>
        <FilterBar
          filters={filters}
          initialFilters={initialFilters}
          setFilters={setFilters}
          setInitialFilters={setInitialFilters}
          servers={servers}
          setFilteredServers={setFilteredServers}
          calcInitialFilters={calcInitialFilters}
        />

        <div style={{ marginTop: '2rem' }}>
          {loading && <LinearProgress />}
          {
            !loading &&
            <ServerTable servers={filteredServers} />
          }
        </div>
      </div>
    </Container>
  )
}

export default App
