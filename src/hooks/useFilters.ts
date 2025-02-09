import { useCallback, useState, useMemo } from 'react'
import HetznerServer from '../types/HetznerServer'
import ServerFilter, { createEmptyFilter } from '../types/ServerFilter'

interface UseFiltersResult {
  filters: ServerFilter
  initialFilters: ServerFilter
  setFilters: (filters: ServerFilter) => void
  applyFilters: (servers: HetznerServer[]) => HetznerServer[]
  calculateInitialFilters: (servers: HetznerServer[]) => ServerFilter
}

export function useFilters(): UseFiltersResult {
  const [filters, setFilters] = useState<ServerFilter>(createEmptyFilter())
  const [initialFilters, setInitialFilters] = useState<ServerFilter>(createEmptyFilter())

  const calculateInitialFilters = useCallback((servers: HetznerServer[]): ServerFilter => {
    const maxRam = Math.max(...servers.map(server => server.ram_size))
    const roundedMaxRam = Math.pow(2, Math.ceil(Math.log2(maxRam)))

    const getMaxDiskSize = (type: keyof HetznerServer['serverDiskData']) => {
      return Math.ceil(Math.max(
        ...servers.map(server => 
          server.serverDiskData[type].length > 0
            ? Math.max(...server.serverDiskData[type])
            : 0
        )
      ) / 1000) * 1000
    }

    const newInitialFilters = {
      cpu: '',
      maxPrice: Math.ceil(Math.max(...servers.map(server => server.price))),
      minRAM: 0,
      maxRAM: roundedMaxRam,
      minNvmeSize: 0,
      maxNvmeSize: getMaxDiskSize('nvme'),
      minNvmeCount: 0,
      maxNvmeCount: Math.max(...servers.map(server => server.serverDiskData.nvme.length)),
      minSataSize: 0,
      maxSataSize: getMaxDiskSize('sata'),
      minSataCount: 0,
      maxSataCount: Math.max(...servers.map(server => server.serverDiskData.sata.length)),
      minHddSize: 0,
      maxHddSize: getMaxDiskSize('hdd'),
      minHddCount: 0,
      maxHddCount: Math.max(...servers.map(server => server.serverDiskData.hdd.length))
    }

    setInitialFilters(newInitialFilters)
    setFilters(newInitialFilters)
    return newInitialFilters
  }, [])

  const applyFilters = useCallback((servers: HetznerServer[]): HetznerServer[] => {
    return servers.filter(server => {
      // CPU filter
      if (filters.cpu && !server.cpu.toLowerCase().includes(filters.cpu.toLowerCase())) {
        return false
      }

      // Price filter
      if (server.price > filters.maxPrice) {
        return false
      }

      // RAM filter
      if ((filters.minRAM && server.ram_size < filters.minRAM) ||
          (filters.maxRAM && server.ram_size > filters.maxRAM)) {
        return false
      }

      // Disk filters
      const diskTypes = ['nvme', 'sata', 'hdd'] as const
      return diskTypes.every(type => {
        const disks = server.serverDiskData[type]
        const minSize = filters[`min${type.toUpperCase()}Size` as keyof ServerFilter] as number
        const maxSize = filters[`max${type.toUpperCase()}Size` as keyof ServerFilter] as number
        const minCount = filters[`min${type.toUpperCase()}Count` as keyof ServerFilter] as number
        const maxCount = filters[`max${type.toUpperCase()}Count` as keyof ServerFilter] as number

        if (disks.length === 0) {
          return !minSize && !minCount
        }

        const matchingDisks = disks.filter(size => 
          (!minSize || size >= minSize) && (!maxSize || size <= maxSize)
        )

        return matchingDisks.length >= (minCount || 0) && 
               matchingDisks.length <= (maxCount || Infinity)
      })
    })
  }, [filters])

  return {
    filters,
    initialFilters,
    setFilters,
    applyFilters,
    calculateInitialFilters
  }
}