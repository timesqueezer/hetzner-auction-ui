import { debounce } from 'lodash-es'
import {
  TextField,
  Grid2 as Grid,
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
  filters: ServerFilter
  initialFilters: ServerFilter
  setFilters: (filters: ServerFilter) => void
  setInitialFilters: (filters: ServerFilter) => void
  servers: HetznerServer[]
  setFilteredServers: (servers: HetznerServer[]) => void
  calcInitialFilters: (serverList: HetznerServer[]) => ServerFilter
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  initialFilters,
  setFilters,
  // setInitialFilters,
  servers,
  setFilteredServers,
  // calcInitialFilters,
}) => {
  const applyFilters = (newFilters: ServerFilter | undefined) => {
    let filtered = servers

    newFilters = newFilters || filters

    if (newFilters && initialFilters) {
      // CPU filter
      if (newFilters.cpu !== initialFilters.cpu) {
        filtered = filtered.filter((server) =>
          server.cpu.toLowerCase().includes(newFilters.cpu!.toLowerCase())
        )
      }

      // Price filter
      if (newFilters.maxPrice !== initialFilters.maxPrice) {
        filtered = filtered.filter((server) => server.price <= newFilters.maxPrice)
      }

      // RAM filter
      if ((newFilters.minRAM !== initialFilters.minRAM) || (newFilters.maxRAM !== initialFilters.maxRAM)) {
        filtered = filtered.filter((server) => {
          const ram = server.ram_size
          return (
            (!newFilters.minRAM || ram >= newFilters.minRAM) &&
            (!newFilters.maxRAM || ram <= newFilters.maxRAM)
          )
        })
      }

      // NVME disk filters
      if (
        (newFilters.minNvmeSize !== initialFilters.minNvmeSize) ||
        (newFilters.maxNvmeSize !== initialFilters.maxNvmeSize) ||
        (newFilters.minNvmeCount !== initialFilters.minNvmeCount) ||
        (newFilters.maxNvmeCount !== initialFilters.maxNvmeCount)
      ) {
        filtered = filtered.filter((server) => {
          const disks = server.serverDiskData.nvme
          const matchingDisks = disks.filter((size) =>
            size >= newFilters.minNvmeSize
            && size <= newFilters.maxNvmeSize
          )
          const diskCount = matchingDisks.length

          return (
            diskCount >= (newFilters.minNvmeCount || 0) &&
            diskCount <= (newFilters.maxNvmeCount || Infinity)
          )
        })
      }

      // SATA disk filters
      if (
        (newFilters.minSataSize !== initialFilters.minSataSize) ||
        (newFilters.maxSataSize !== initialFilters.maxSataSize) ||
        (newFilters.minSataCount !== initialFilters.minSataCount) ||
        (newFilters.maxSataCount !== initialFilters.maxSataCount)
      ) {
        filtered = filtered.filter((server) => {
          const disks = server.serverDiskData.sata
          const matchingDisks = disks.filter((size) =>
            size >= newFilters.minSataSize
            && size <= newFilters.maxSataSize
          )
          const diskCount = matchingDisks.length

          return (
            diskCount >= (newFilters.minSataCount || 0) &&
            diskCount <= (newFilters.maxSataCount || Infinity)
          )
        })
      }

      // HDD disk filters
      if (
        (newFilters.minHddSize !== initialFilters.minHddSize) ||
        (newFilters.maxHddSize !== initialFilters.maxHddSize) ||
        (newFilters.minHddCount !== initialFilters.minHddCount) ||
        (newFilters.maxHddCount !== initialFilters.maxHddCount)
      ) {
        filtered = filtered.filter((server) => {
          const disks = server.serverDiskData.hdd
          const matchingDisks = disks.filter((size) =>
            size >= newFilters.minHddSize
            && size <= newFilters.maxHddSize
          )
          const diskCount = matchingDisks.length

          return (
            diskCount >= (newFilters.minHddCount || 0) &&
            diskCount <= (newFilters.maxHddCount || Infinity)
          )
        })
      }
    }

    setFilteredServers(filtered)
    // const newInitialFilters = calcInitialFilters(filtered)
    // setInitialFilters(newInitialFilters)
  }

  const debouncedApplyFilters = debounce(applyFilters, 250)

  const setAndApplyFiltersDebounced = (newFilters: ServerFilter | undefined) => {
    if (newFilters) {
      setFilters(newFilters)
      debouncedApplyFilters(newFilters)
    }
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Grid container columnSpacing={8}>
        {/* CPU Filter */}
        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <TextField
            label="CPU"
            fullWidth
            onChange={
              (e: ChangeEvent<HTMLInputElement>) =>
                setAndApplyFiltersDebounced({ ...filters, cpu: e.target.value })
            }
          />
        </Grid>

        {/* Price Filter */}
        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <Box>
            <Typography gutterBottom>
              Price
            </Typography>
            <Slider
              value={filters.maxPrice}
              min={0}
              step={1}
              max={initialFilters.maxPrice}
              getAriaValueText={(v) => `${v}€`}
              valueLabelFormat={(v) => `${v}€`}
              onChange={(_e, value) => setAndApplyFiltersDebounced({ ...filters, maxPrice: value as number })}
              valueLabelDisplay="auto"
              marks={[
                { value: 0, label: '0€' },
                { value: initialFilters.maxPrice, label: `${initialFilters.maxPrice}€` },
              ]}
            />
          </Box>
        </Grid>

        {/* RAM Filters */}
        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <RamSlider
            value={[filters.minRAM || 0, filters.maxRAM || 0]}
            setValue={
              (value: number[]) => setAndApplyFiltersDebounced({ ...filters, minRAM: value[0], maxRAM: value[1] })
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <Box>
            <Typography gutterBottom>
              NVMe Disk Size
            </Typography>
            <Slider
              value={[filters.minNvmeSize, filters.maxNvmeSize]}
              min={0}
              max={initialFilters.maxNvmeSize}
              step={1000}
              getAriaValueText={(v) => `${v}GB`}
              valueLabelFormat={(v) => `${v}GB`}
              onChange={
                (_e, value) =>
                  Array.isArray(value) && value.length === 2
                    ? setAndApplyFiltersDebounced({ ...filters, minNvmeSize: value[0] as number, maxNvmeSize: value[1] as number })
                    : null
              }
              valueLabelDisplay="auto"
              marks={[
                { value: 0, label: '0GB' },
                { value: initialFilters.maxNvmeSize, label: `${initialFilters.maxNvmeSize}GB` },
              ]}
            />
          </Box>
          <Box>
            <Typography gutterBottom>
              NVMe Disk Count
            </Typography>
            <Slider
              value={[filters.minNvmeCount, filters.maxNvmeCount]}
              min={0}
              max={initialFilters.maxNvmeCount}
              step={1}
              getAriaValueText={(v) => `${v}`}
              valueLabelFormat={(v) => `${v}`}
              onChange={
                (_e, value) =>
                  Array.isArray(value) && value.length === 2
                    ? setAndApplyFiltersDebounced({ ...filters, minNvmeCount: value[0] as number, maxNvmeCount: value[1] as number })
                    : null
              }
              valueLabelDisplay="auto"
              marks={[
                { value: 0, label: '0' },
                { value: initialFilters.maxNvmeCount, label: `${initialFilters.maxNvmeCount}` },
              ]}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <Box>
            <Typography gutterBottom>
              Sata Disk Size
            </Typography>
            <Slider
              value={[filters.minSataSize, filters.maxSataSize]}
              min={0}
              max={initialFilters.maxSataSize}
              step={1000}
              getAriaValueText={(v) => `${v}GB`}
              valueLabelFormat={(v) => `${v}GB`}
              onChange={
                (_e, value) =>
                  Array.isArray(value) && value.length === 2
                    ? setAndApplyFiltersDebounced({ ...filters, minSataSize: value[0] as number, maxSataSize: value[1] as number })
                    : null
              }
              valueLabelDisplay="auto"
              marks={[
                { value: 0, label: '0GB' },
                { value: initialFilters.maxSataSize, label: `${initialFilters.maxSataSize}GB` },
              ]}
            />
          </Box>
          <Box>
            <Typography gutterBottom>
              Sata Disk Count
            </Typography>
            <Slider
              value={[filters.minSataCount, filters.maxSataCount]}
              min={0}
              max={initialFilters.maxSataCount}
              step={1}
              getAriaValueText={(v) => `${v}`}
              valueLabelFormat={(v) => `${v}`}
              onChange={
                (_e, value) =>
                  Array.isArray(value) && value.length === 2
                    ? setAndApplyFiltersDebounced({ ...filters, minSataCount: value[0] as number, maxSataCount: value[1] as number })
                    : null
              }
              valueLabelDisplay="auto"
              marks={[
                { value: 0, label: '0' },
                { value: initialFilters.maxSataCount, label: `${initialFilters.maxSataCount}` },
              ]}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <Box>
            <Typography gutterBottom>
              HDD Disk Size
            </Typography>
            <Slider
              value={[filters.minHddSize, filters.maxHddSize]}
              min={0}
              max={initialFilters.maxHddSize}
              step={1000}
              getAriaValueText={(v) => `${v / 1000}TB`}
              valueLabelFormat={(v) => `${v / 1000}TB`}
              onChange={
                (_e, value) =>
                  Array.isArray(value) && value.length === 2
                    ? setAndApplyFiltersDebounced({ ...filters, minHddSize: value[0] as number, maxHddSize: value[1] as number })
                    : null
              }
              valueLabelDisplay="auto"
              marks={[
                { value: 0, label: '0TB' },
                { value: initialFilters.maxHddSize, label: `${initialFilters.maxHddSize / 1000}TB` },
              ]}
            />
          </Box>
          <Box>
            <Typography gutterBottom>
              HDD Disk Count
            </Typography>
            <Slider
              value={[filters.minHddCount, filters.maxHddCount]}
              min={0}
              max={initialFilters.maxHddCount}
              step={1}
              getAriaValueText={(v) => `${v}`}
              valueLabelFormat={(v) => `${v}`}
              onChange={
                (_e, value) =>
                  Array.isArray(value) && value.length === 2
                    ? setAndApplyFiltersDebounced({ ...filters, minHddCount: value[0] as number, maxHddCount: value[1] as number })
                    : null
              }
              valueLabelDisplay="auto"
              marks={[
                { value: 0, label: '0' },
                { value: initialFilters.maxHddCount, label: `${initialFilters.maxHddCount}` },
              ]}
            />
          </Box>
        </Grid>

      </Grid>
    </Paper>
  )
}

export default FilterBar
