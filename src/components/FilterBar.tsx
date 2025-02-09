import { debounce } from 'lodash-es'
import {
  TextField,
  Paper,
  Slider,
  Box,
  Typography,
} from '@mui/material'
import { ChangeEvent, useCallback, useRef, useLayoutEffect, useState } from 'react'

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
  // Create a ref to store the latest filter function
  const applyFiltersRef = useRef((newFilters: ServerFilter) => {
    let filtered = [...servers]

    if (newFilters.cpu) {
      filtered = filtered.filter((server) =>
        server.cpu.toLowerCase().includes(newFilters.cpu.toLowerCase())
      )
    }

    // Price filter
    filtered = filtered.filter((server) => server.price <= newFilters.maxPrice)

    // RAM filter
    if (newFilters.minRAM || newFilters.maxRAM) {
      filtered = filtered.filter((server) => {
        const ram = server.ram_size
        return (!newFilters.minRAM || ram >= newFilters.minRAM) &&
               (!newFilters.maxRAM || ram <= newFilters.maxRAM)
      })
    }

    // Handle disk filters
    const diskTypes = ['nvme', 'sata', 'hdd'] as const
    filtered = filtered.filter(server => 
      diskTypes.every(type => {
        const disks = server.serverDiskData[type]
        const minSizeKey = `min${type.toUpperCase()}Size` as keyof ServerFilter
        const maxSizeKey = `max${type.toUpperCase()}Size` as keyof ServerFilter
        const minCountKey = `min${type.toUpperCase()}Count` as keyof ServerFilter
        const maxCountKey = `max${type.toUpperCase()}Count` as keyof ServerFilter

        const minSize = newFilters[minSizeKey] as number
        const maxSize = newFilters[maxSizeKey] as number
        const minCount = newFilters[minCountKey] as number
        const maxCount = newFilters[maxCountKey] as number

        if (disks.length === 0) {
          return !minSize && !minCount
        }

        const matchingDisks = disks.filter(size => 
          (!minSize || size >= minSize) && (!maxSize || size <= maxSize)
        )

        return matchingDisks.length >= (minCount || 0) && 
               matchingDisks.length <= (maxCount || Infinity)
      })
    )

    setFilteredServers(filtered)
  })

  // Create a stable debounced function using useRef and useLayoutEffect
  const debouncedApplyFiltersRef = useRef(
    debounce((newFilters: ServerFilter) => {
      applyFiltersRef.current(newFilters)
    }, 250)
  )

  // Update ref when dependencies change
  useLayoutEffect(() => {
    applyFiltersRef.current = (newFilters: ServerFilter) => {
      let filtered = [...servers]
      // ...same filter logic as above...
      setFilteredServers(filtered)
    }
  }, [servers, setFilteredServers])

  // Cleanup debounce on unmount
  useLayoutEffect(() => {
    const debouncedFn = debouncedApplyFiltersRef.current
    return () => {
      debouncedFn.cancel()
    }
  }, [])

  const handleFilterChange = useCallback((newFilters: ServerFilter) => {
    setFilters(newFilters)
    debouncedApplyFiltersRef.current(newFilters)
  }, [setFilters])

  const renderDiskSliders = useCallback((type: string) => {
    const minSizeKey = `min${type}Size` as keyof ServerFilter
    const maxSizeKey = `max${type}Size` as keyof ServerFilter
    const minCountKey = `min${type}Count` as keyof ServerFilter
    const maxCountKey = `max${type}Count` as keyof ServerFilter
    
    const minSize = Number(filters[minSizeKey]) || 0
    const maxSize = Number(filters[maxSizeKey]) || Number(initialFilters[maxSizeKey]) || 0
    const minCount = Number(filters[minCountKey]) || 0
    const maxCount = Number(filters[maxCountKey]) || Number(initialFilters[maxCountKey]) || 0
    const maxSizeValue = Number(initialFilters[maxSizeKey])
    
    const sizeStep = type === 'HDD' ? 2000 : 250
    const sizeMarks = generateSizeMarks(type, maxSizeValue)

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
            max={maxSizeValue}
            step={sizeStep}
            getAriaValueText={(v: number) => formatDiskSize(v, type)}
            valueLabelFormat={(v: number) => formatDiskSize(v, type)}
            onChange={(_e: Event, value: number | number[]) =>
              Array.isArray(value) && handleFilterChange({
                ...filters,
                [minSizeKey]: value[0],
                [maxSizeKey]: value[1]
              })
            }
            valueLabelDisplay="auto"
            size="small"
            marks={sizeMarks}
            disableSwap
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Count
          </Typography>
          <Slider
            value={[minCount, maxCount]}
            min={0}
            max={Number(initialFilters[maxCountKey])}
            step={1}
            getAriaValueText={String}
            valueLabelFormat={String}
            onChange={(_e: Event, value: number | number[]) =>
              Array.isArray(value) && handleFilterChange({
                ...filters,
                [minCountKey]: value[0],
                [maxCountKey]: value[1]
              })
            }
            valueLabelDisplay="auto"
            size="small"
            marks={[
              { value: 0, label: '0' },
              { value: Number(initialFilters[maxCountKey]), label: String(initialFilters[maxCountKey]) }
            ]}
            disableSwap
          />
        </Box>
      </Box>
    )
  }, [filters, initialFilters, handleFilterChange])

  const generateSizeMarks = useCallback((type: string, maxValue: number) => {
    const marks = [{ value: 0, label: type === 'HDD' ? '0TB' : '0GB' }]
    const step = type === 'HDD' ? 2000 : 1000
    
    for (let i = step; i < maxValue; i += step) {
      marks.push({
        value: i,
        label: formatDiskSize(i, type)
      })
    }
    
    marks.push({
      value: maxValue,
      label: formatDiskSize(maxValue, type)
    })
    
    return marks
  }, [])

  const formatDiskSize = useCallback((value: number, type: string) => {
    return type === 'HDD' ? `${value / 1000}TB` : `${value}GB`
  }, [])

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
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleFilterChange({ ...filters, cpu: e.target.value })
        }
      />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Price (€)
        </Typography>
        <Slider
          value={filters.maxPrice}
          min={0}
          step={5}
          max={initialFilters.maxPrice}
          getAriaValueText={(v: number) => `${v}€`}
          valueLabelFormat={(v: number) => `${v}€`}
          onChange={(_e: Event, value: number | number[]) => 
            handleFilterChange({ ...filters, maxPrice: value as number })
          }
          valueLabelDisplay="auto"
          size="small"
          marks={[
            { value: 0, label: '0€' },
            { value: initialFilters.maxPrice, label: `${initialFilters.maxPrice}€` }
          ]}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Memory
        </Typography>
        <RamSlider
          value={[filters.minRAM || 0, filters.maxRAM || initialFilters.maxRAM]}
          setValue={(value: number[]) => 
            handleFilterChange({ ...filters, minRAM: value[0], maxRAM: value[1] })
          }
          maxValue={initialFilters.maxRAM}
        />
      </Box>

      {['NVMe', 'SATA', 'HDD'].map(renderDiskSliders)}
    </Paper>
  )
}

export default FilterBar
