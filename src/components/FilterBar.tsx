import {
  TextField,
  Grid2 as Grid,
  Button,
  MenuItem,
  Paper,
  Slider,
  Box,
  Typography,
} from '@mui/material'
import { ChangeEvent } from 'react'

import RamSlider from './RamSlider'

import HetznerServer from '../types/HetznerServer'
import ServerFilter from '../types/ServerFilter'

type FilterBarProps = {
  filters: ServerFilter;
  setFilters: (filters: ServerFilter) => void;
  servers: HetznerServer[];
  setFilteredServers: (servers: HetznerServer[]) => void;
};

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, servers, setFilteredServers }) => {
  const applyFilters = () => {
    let filtered = servers;

    // CPU filter
    if (filters.cpu) {
      filtered = filtered.filter((server) =>
        server.cpu.toLowerCase().includes(filters.cpu!.toLowerCase())
      );
    }

    // RAM filter
    if (filters.minRAM || filters.maxRAM) {
      filtered = filtered.filter((server) => {
        const ram = server.ram_size;
        return (
          (!filters.minRAM || ram >= filters.minRAM) &&
          (!filters.maxRAM || ram <= filters.maxRAM)
        );
      });
    }

    // Price filter
    if (filters.maxPrice) {
      filtered = filtered.filter((server) => server.price <= filters.maxPrice!);
    }

    // Storage filter
    if (filters.minStorage) {
      filtered = filtered.filter((server) =>
        server.hdd_arr.some((disk) => parseInt(disk.match(/\d+/)![0]) >= filters.minStorage!)
      );
    }

    // SSD/NVMe disk filters
    if (filters.diskType && filters.minDiskSize && (filters.minDiskCount || filters.maxDiskCount)) {
      filtered = filtered.filter((server) => {
        const disks =
          filters.diskType === "SSD"
            ? server.serverDiskData.sata.concat(server.serverDiskData.nvme)
            : [];

        const matchingDisks = disks.filter((size) => size >= filters.minDiskSize!);
        const diskCount = matchingDisks.length;

        return (
          diskCount >= (filters.minDiskCount || 0) &&
          diskCount <= (filters.maxDiskCount || Infinity)
        );
      });
    }

    // HDD disk filters
    if (filters.hddMinDiskSize && (filters.hddMinDiskCount || filters.hddMaxDiskCount)) {
      filtered = filtered.filter((server) => {
        const disks = server.serverDiskData.hdd;
        const matchingDisks = disks.filter((size) => size >= filters.hddMinDiskSize!);
        const diskCount = matchingDisks.length;

        return (
          diskCount >= (filters.hddMinDiskCount || 0) &&
          diskCount <= (filters.hddMaxDiskCount || Infinity)
        );
      });
    }

    setFilteredServers(filtered);
  };

  return (
    <Paper style={{ padding: '1rem' }}>
      <Grid container spacing={2} sx={{ marginBottom: "1rem" }}>
        {/* CPU Filter */}
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <TextField
            label="CPU"
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFilters({ ...filters, cpu: e.target.value })
            }
          />
        </Grid>

        {/* RAM Filters */}
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          {/* RAM
          <Slider
            getAriaLabel={() => 'RAM Slider'}
            value={[filters.minRAM || 0, filters.maxRAM || 0]}
            onChange={
              (_e: Event, newValue: number | number[]) => {
                const [minRAM, maxRAM] = newValue as number[];
                setFilters({ ...filters, minRAM, maxRAM });
              }
            }
            valueLabelDisplay="auto"
            getAriaValueText={(value) => `${value}GB`}
            min={0}
            max={Math.max(...servers.map((server) => server.ram_size))}
            marks={[
              { value: 0, label: "0GB" },
              { value: 1024, label: "1024GB" },
            ]}
          /> */}
          <RamSlider
            value={[filters.minRAM || 0, filters.maxRAM || 0]}
            setValue={
              (value: number[]) => setFilters({ ...filters, minRAM: value[0], maxRAM: value[1] })
            }
          />
        </Grid>

        {/* Price Filter */}
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <TextField
            label="Max Price (€)"
            type="number"
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFilters({ ...filters, maxPrice: parseFloat(e.target.value) })
            }
          />
          <Box>
            <Typography gutterBottom id="non-linear-slider">
              Price
            </Typography>
            <Slider
              value={filters.maxPrice}
              min={0}
              step={1}
              max={Math.max(...servers.map((server) => server.price))}
              getAriaValueText={(v) => `${v}€`}
              valueLabelFormat={(v) => `${v}€`}
              onChange={(_e, value) => setFilters({ ...filters, maxPrice: value as number })}
              valueLabelDisplay="auto"
            />
          </Box>
        </Grid>

        {/* SSD/NVMe Disk Filters */}
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <TextField
            label="Disk Type"
            select
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFilters({ ...filters, diskType: e.target.value })
            }
          >
            <MenuItem value="SSD">SSD</MenuItem>
            <MenuItem value="NVMe">NVMe</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <TextField
            label="Min Disk Size (GB)"
            type="number"
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFilters({ ...filters, minDiskSize: parseInt(e.target.value) })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <TextField
            label="Min Disk Count"
            type="number"
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFilters({ ...filters, minDiskCount: parseInt(e.target.value) })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <TextField
            label="Max Disk Count"
            type="number"
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFilters({ ...filters, maxDiskCount: parseInt(e.target.value) })
            }
          />
        </Grid>

        {/* HDD Disk Filters */}
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <TextField
            label="Min HDD Size (GB)"
            type="number"
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFilters({ ...filters, hddMinDiskSize: parseInt(e.target.value) })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <TextField
            label="Min HDD Count"
            type="number"
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFilters({ ...filters, hddMinDiskCount: parseInt(e.target.value) })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <TextField
            label="Max HDD Count"
            type="number"
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFilters({ ...filters, hddMaxDiskCount: parseInt(e.target.value) })
            }
          />
        </Grid>

        {/* Apply Filters Button */}
        <Grid size={{ xs: 12 }}>
          <Button variant="contained" onClick={applyFilters}>
            Apply Filters
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FilterBar;
