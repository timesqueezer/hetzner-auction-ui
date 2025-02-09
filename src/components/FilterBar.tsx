import { debounce } from 'lodash-es'
import {
  TextField,
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

const FilterBar = ({
  filters,
  initialFilters,
  setFilters,
  servers,
  setFilteredServers,
}: FilterBarProps) => {
  const applyFilters = (newFilters: ServerFilter | undefined) => {
    let filtered = servers

    newFilters = newFilters || filters

    if (newFilters && initialFilters) {
      // CPU filter
      if (newFilters.cpu !== initialFilters.cpu) {
        filtered = filtered.filter((server: HetznerServer) =>
          server.cpu.toLowerCase().includes(newFilters.cpu!.toLowerCase())
        )
      }

      // Price filter
      if (newFilters.maxPrice !== initialFilters.maxPrice) {
        filtered = filtered.filter((server: HetznerServer) => server.price <= newFilters.maxPrice)
      }

      // RAM filter
      if ((newFilters.minRAM !== initialFilters.minRAM) || (newFilters.maxRAM !== initialFilters.maxRAM)) {
        filtered = filtered.filter((server: HetznerServer) => {
          const ram = server.ram_size
          return (
            (!newFilters.minRAM || ram >= newFilters.minRAM) &&
            (!newFilters.maxRAM || ram <= newFilters.maxRAM)
          )
        })
      }

      // Handle disk filters
      const handleDiskFilter = (server: HetznerServer, type: 'nvme' | 'sata' | 'hdd') => {
        const disks = server.serverDiskData[type]
        const minSize = newFilters[`min${type.toUpperCase()}Size` as keyof ServerFilter] as number
        const maxSize = newFilters[`max${type.toUpperCase()}Size` as keyof ServerFilter] as number
        const minCount = newFilters[`min${type.toUpperCase()}Count` as keyof ServerFilter] as number
        const maxCount = newFilters[`max${type.toUpperCase()}Count` as keyof ServerFilter] as number

        const matchingDisks = disks.filter((size: number) =>
          size >= minSize && size <= maxSize
        )
        const diskCount = matchingDisks.length

        return (
          diskCount >= (minCount || 0) &&
          diskCount <= (maxCount || Infinity)
        )
      }

      // Apply disk filters
      if (Object.keys(newFilters).some(key => key.match(/^(min|max)(Nvme|Sata|Hdd)(Size|Count)$/))) {
        filtered = filtered.filter((server: HetznerServer) => {
          return ['nvme', 'sata', 'hdd'].every(type => 
            handleDiskFilter(server, type as 'nvme' | 'sata' | 'hdd')
          )
        })
      }
    }

    setFilteredServers(filtered)
  }

  const debouncedApplyFilters = debounce(applyFilters, 250)

  const setAndApplyFiltersDebounced = (newFilters: ServerFilter) => {
    setFilters(newFilters)
    debouncedApplyFilters(newFilters)
  }

  return (
    <Paper sx={{ 
      p: { xs: 2, sm: 3 },
      height: '100%',
      overflow: 'auto',
      '::-webkit-scrollbar': {
        width: '8px',
      },
      '::-webkit-scrollbar-thumb': {
        backgroundColor: 'divider',
        borderRadius: '4px',
      },
    }}>
      <TextField
        label="CPU"
        fullWidth
        size="small"
        value={filters.cpu || ''}
        sx={{ mb: 2 }}
        onChange={
          (e: ChangeEvent<HTMLInputElement>) =>
            setAndApplyFiltersDebounced({ ...filters, cpu: e.target.value })
        }
      />
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Price
        </Typography>
        <Slider
          value={filters.maxPrice || 0}
          min={0}
          step={1}
          max={initialFilters.maxPrice}
          getAriaValueText={(v: number) => `${v}€`}
          valueLabelFormat={(v: number) => `${v}€`}
          onChange={(_e: Event, value: number | number[]) => 
            setAndApplyFiltersDebounced({ ...filters, maxPrice: value as number })
          }
          valueLabelDisplay="auto"
          size="small"
          marks={true}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <RamSlider
          value={[filters.minRAM || 0, filters.maxRAM || 0]}
          setValue={
            (value: number[]) => setAndApplyFiltersDebounced({ ...filters, minRAM: value[0], maxRAM: value[1] })
          }
        />
      </Box>
      
      {/* Disk sections with consistent spacing */}
      {['NVMe', 'SATA', 'HDD'].map((type) => {
        const minSizeKey = `min${type}Size` as keyof ServerFilter;
        const maxSizeKey = `max${type}Size` as keyof ServerFilter;
        const minCountKey = `min${type}Count` as keyof ServerFilter;
        const maxCountKey = `max${type}Count` as keyof ServerFilter;
        
        const minSize = (filters[minSizeKey] || 0) as number;
        const maxSize = (filters[maxSizeKey] || initialFilters[maxSizeKey] || 0) as number;
        const minCount = (filters[minCountKey] || 0) as number;
        const maxCount = (filters[maxCountKey] || initialFilters[maxCountKey] || 0) as number;
        
        return (
          <Box key={type} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              {type} Disks
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Size
              </Typography>
              <Slider
                value={[minSize, maxSize]}
                min={0}
                max={initialFilters[maxSizeKey] as number}
                step={1000}
                getAriaValueText={(v: number) => type === 'HDD' ? `${v / 1000}TB` : `${v}GB`}
                valueLabelFormat={(v: number) => type === 'HDD' ? `${v / 1000}TB` : `${v}GB`}
                onChange={
                  (_e: Event, value: number | number[]) =>
                    Array.isArray(value) && value.length === 2
                      ? setAndApplyFiltersDebounced({
                          ...filters,
                          [minSizeKey]: value[0],
                          [maxSizeKey]: value[1]
                        })
                      : null
                }
                valueLabelDisplay="auto"
                size="small"
                marks={true}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Count
              </Typography>
              <Slider
                value={[minCount, maxCount]}
                min={0}
                max={initialFilters[maxCountKey] as number}
                step={1}
                getAriaValueText={(v: number) => `${v}`}
                valueLabelFormat={(v: number) => `${v}`}
                onChange={
                  (_e: Event, value: number | number[]) =>
                    Array.isArray(value) && value.length === 2
                      ? setAndApplyFiltersDebounced({
                          ...filters,
                          [minCountKey]: value[0],
                          [maxCountKey]: value[1]
                        })
                      : null
                }
                valueLabelDisplay="auto"
                size="small"
                marks={true}
              />
            </Box>
          </Box>
        );
      })}
    </Paper>
  );
};

export default FilterBar;
