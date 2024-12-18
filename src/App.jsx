import React, { useEffect, useState } from "react"
import axios from "axios"
import ServerTable from "./components/ServerTable"
import FilterBar from "./components/FilterBar"
import { Container, Typography } from "@mui/material"

const App = () => {
  const [servers, setServers] = useState([])
  const [filteredServers, setFilteredServers] = useState([])
  const [filters, setFilters] = useState({})

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
    <Container maxWidth="lg" sx={{ marginTop: "2rem" }}>
      <Typography variant="h4" gutterBottom align="center">
        Hetzner Auction UI
      </Typography>
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        servers={servers}
        setFilteredServers={setFilteredServers}
      />
      <ServerTable servers={filteredServers} />
    </Container>
  )
}

export default App
