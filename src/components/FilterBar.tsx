import {
  TextField,
  Grid2 as Grid,
  Button,
  MenuItem,
  Paper,
} from "@mui/material"
import { styled } from '@mui/material/styles'
import { grey } from '@mui/material/colors'
import { ChangeEvent } from 'react'

import HetznerServer from "../types/HetznerServer"

/* type Server = {
  cpu: string
  ram_size: number
  price: number
  hdd_arr: string[]
  serverDiskData: {
    nvme: number[]
    sata: number[]
    hdd: number[]
    general: number[]
  }
} */

type Filters = {
  cpu?: string
  minRAM?: number
  maxPrice?: number
  minStorage?: number
  diskType?: string
  diskSize?: number
  diskCount?: number
}

type FilterBarProps = {
  filters: Filters
  setFilters: (filters: Filters) => void
  servers: HetznerServer[]
  setFilteredServers: (servers: HetznerServer[]) => void
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, servers, setFilteredServers }) => {
  const applyFilters = () => {
    let filtered = servers

    // Combine all filters
    if (filters.cpu) {
      filtered = filtered.filter((server) => server.cpu.toLowerCase().includes(filters.cpu!.toLowerCase()))
    }
    if (filters.minRAM) {
      filtered = filtered.filter((server) => server.ram_size >= filters.minRAM!)
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((server) => server.price <= filters.maxPrice!)
    }
    if (filters.minStorage) {
      filtered = filtered.filter((server) =>
        server.hdd_arr.some((disk) => parseInt(disk.match(/\d+/)![0]) >= filters.minStorage!)
      )
    }
    if (filters.diskType && filters.diskSize && filters.diskCount) {
      filtered = filtered.filter((server) => {
        const disks =
          filters.diskType === "SSD"
            ? server.serverDiskData.sata
            : filters.diskType === "HDD"
            ? server.serverDiskData.hdd
            : []
        const matchingDisks = disks.filter((size) => size >= filters.diskSize!)
        return matchingDisks.length >= filters.diskCount!
      })
    }

    setFilteredServers(filtered)
  }

  const Item = styled(Paper)()

  return (
    <Paper style={{ padding: '1rem' }}>
      <Grid container spacing={2} sx={{ marginBottom: "1rem" }}>
        <Grid size={{ xs: 12, sm:4, md: 3 }}>
          <Item>
            <TextField
              label="CPU"
              fullWidth
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, cpu: e.target.value })}
            />
          </Item>
        </Grid>
        <Grid size={{ xs: 12, sm:4, md: 3 }}>
          <Item>
            <TextField
              label="Min RAM (GB)"
              type="number"
              fullWidth
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, minRAM: parseInt(e.target.value) })}
            />
          </Item>
        </Grid>
        <Grid size={{ xs: 12, sm:4, md: 3 }}>
          <Item>
            <TextField
              label="Max Price (€)"
              type="number"
              fullWidth
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, maxPrice: parseFloat(e.target.value) })}
            />
          </Item>
        </Grid>
        <Grid size={{ xs: 12, sm:4, md: 3 }}>
          <Item>
            <TextField
              label="Min Storage (GB)"
              type="number"
              fullWidth
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, minStorage: parseInt(e.target.value) })}
            />
          </Item>
        </Grid>
        <Grid size={{ xs: 12, sm:4, md: 2 }}>
          <Item>
            <TextField
              label="Disk Type"
              select
              fullWidth
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, diskType: e.target.value })}
            >
              <MenuItem value="SSD">SSD</MenuItem>
              <MenuItem value="HDD">HDD</MenuItem>
            </TextField>
          </Item>
        </Grid>
        <Grid size={{ xs: 12, sm:4, md: 2 }}>
          <Item>
            <TextField
              label="Disk Size (GB)"
              type="number"
              fullWidth
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, diskSize: parseInt(e.target.value) })}
            />
          </Item>
        </Grid>
        <Grid size={{ xs: 12, sm:4, md: 2 }}>
          <Item>
            <TextField
              label="Disk Count"
              type="number"
              fullWidth
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, diskCount: parseInt(e.target.value) })}
            />
          </Item>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Item>
            <Button variant="contained" onClick={applyFilters}>
              Apply Filters
            </Button>
          </Item>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default FilterBar
