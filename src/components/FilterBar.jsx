import {
  TextField,
  Grid2 as Grid,
  Button,
  MenuItem,
  Paper,
} from "@mui/material"
import { styled } from '@mui/material/styles'


const FilterBar = ({ filters, setFilters, servers, setFilteredServers }) => {
  const applyFilters = () => {
    let filtered = servers

    // Combine all filters
    if (filters.cpu) {
      filtered = filtered.filter((server) => server.cpu.toLowerCase().includes(filters.cpu.toLowerCase()))
    }
    if (filters.minRAM) {
      filtered = filtered.filter((server) => server.ram_size >= filters.minRAM)
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((server) => server.price <= filters.maxPrice)
    }
    if (filters.minStorage) {
      filtered = filtered.filter((server) =>
        server.hdd_arr.some((disk) => parseInt(disk.match(/\d+/)) >= filters.minStorage)
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
        const matchingDisks = disks.filter((size) => size >= filters.diskSize)
        return matchingDisks.length >= filters.diskCount
      })
    }

    setFilteredServers(filtered)
  }

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    ...theme.applyStyles('dark', {
      backgroundColor: '#1A2027',
    }),
  }))

  return (
    <Grid container spacing={2} sx={{ marginBottom: "1rem" }}>
      <Grid xs={12} sm={6} md={3}>
        <Item>
          <TextField
            label="CPU"
            fullWidth
            onChange={(e) => setFilters({ ...filters, cpu: e.target.value })}
          />
        </Item>
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <Item>
          <TextField
            label="Min RAM (GB)"
            type="number"
            fullWidth
            onChange={(e) => setFilters({ ...filters, minRAM: parseInt(e.target.value) })}
          />
        </Item>
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <Item>
          <TextField
            label="Max Price (€)"
            type="number"
            fullWidth
            onChange={(e) => setFilters({ ...filters, maxPrice: parseFloat(e.target.value) })}
          />
        </Item>
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <Item>
          <TextField
            label="Min Storage (GB)"
            type="number"
            fullWidth
            onChange={(e) => setFilters({ ...filters, minStorage: parseInt(e.target.value) })}
          />
        </Item>
      </Grid>
      <Grid xs={12} sm={4} md={2}>
        <Item>
          <TextField
            label="Disk Type"
            select
            fullWidth
            onChange={(e) => setFilters({ ...filters, diskType: e.target.value })}
          >
            <MenuItem value="SSD">SSD</MenuItem>
            <MenuItem value="HDD">HDD</MenuItem>
          </TextField>
        </Item>
      </Grid>
      <Grid xs={12} sm={4} md={2}>
        <Item>
          <TextField
            label="Disk Size (GB)"
            type="number"
            fullWidth
            onChange={(e) => setFilters({ ...filters, diskSize: parseInt(e.target.value) })}
          />
        </Item>
      </Grid>
      <Grid xs={12} sm={4} md={2}>
        <Item>
          <TextField
            label="Disk Count"
            type="number"
            fullWidth
            onChange={(e) => setFilters({ ...filters, diskCount: parseInt(e.target.value) })}
          />
        </Item>
      </Grid>
      <Grid xs={12}>
        <Item>
          <Button variant="contained" fullWidth onClick={applyFilters}>
            Apply Filters
          </Button>
        </Item>
      </Grid>
    </Grid>
  )
}

export default FilterBar
