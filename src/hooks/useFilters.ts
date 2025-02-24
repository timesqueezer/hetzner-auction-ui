import { useCallback, useState } from 'react'
import HetznerServer from '../types/HetznerServer'
import ServerFilter, { createEmptyFilter } from '../types/ServerFilter'

interface UseFiltersResult {
  filters: ServerFilter
  initialFilters: ServerFilter
  setFilters: (filters: ServerFilter) => void
  applyFilters: (servers: HetznerServer[]) => HetznerServer[]
  calculateInitialFilters: (servers: HetznerServer[]) => void
}

export function useFilters(): UseFiltersResult {
  console.log('useFilters: Hook initializing')
  
  const [filters, setFilters] = useState<ServerFilter>(createEmptyFilter())
  const [initialFilters, setInitialFilters] = useState<ServerFilter>(createEmptyFilter())

  const calculateInitialFilters = useCallback((servers: HetznerServer[]): void => {
    console.log('useFilters: Calculating initial filters', {
      serverCount: servers.length
    })
    
    if (!servers.length) return;

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
      ...createEmptyFilter(),
      maxPrice: Math.ceil(Math.max(...servers.map(server => server.price))),
      maxRAM: roundedMaxRam,
      maxNvmeSize: getMaxDiskSize('nvme'),
      maxNvmeCount: Math.max(...servers.map(server => server.serverDiskData.nvme.length)),
      maxSataSize: getMaxDiskSize('sata'),
      maxSataCount: Math.max(...servers.map(server => server.serverDiskData.sata.length)),
      maxHddSize: getMaxDiskSize('hdd'),
      maxHddCount: Math.max(...servers.map(server => server.serverDiskData.hdd.length))
    }

    console.log('useFilters: Setting initial filters', newInitialFilters)
    setInitialFilters(newInitialFilters)
    setFilters(newInitialFilters)
  }, [])

  const applyFilters = useCallback((servers: HetznerServer[]): HetznerServer[] => {
    console.log('useFilters: Applying filters', {
      serverCount: servers.length,
      currentFilters: filters
    })
    
    const filtered = servers.filter(server => {
      // CPU filter
      if (filters.cpu && !server.cpu.toLowerCase().includes(filters.cpu.toLowerCase())) {
        return false
      }

      // Price filter
      if (filters.maxPrice && server.price > filters.maxPrice) {
        return false
      }

      // RAM filter
      if (server.ram_size < filters.minRAM || 
          (filters.maxRAM && server.ram_size > filters.maxRAM)) {
        return false
      }

      // Disk filters
      const diskTypes = ['nvme', 'sata', 'hdd'] as const
      return diskTypes.every(type => {
        const disks = server.serverDiskData[type]
        const minSizeKey = `min${type.toUpperCase()}Size` as keyof ServerFilter
        const maxSizeKey = `max${type.toUpperCase()}Size` as keyof ServerFilter
        const minCountKey = `min${type.toUpperCase()}Count` as keyof ServerFilter
        const maxCountKey = `max${type.toUpperCase()}Count` as keyof ServerFilter

        const minSize = filters[minSizeKey] as number
        const maxSize = filters[maxSizeKey] as number
        const minCount = filters[minCountKey] as number
        const maxCount = filters[maxCountKey] as number

        if (disks.length === 0) {
          return !minSize && !minCount
        }

        const matchingDisks = disks.filter(size => 
          (!minSize || size >= minSize) && (!maxSize || size <= maxSize)
        )

        return (!minCount || matchingDisks.length >= minCount) && 
               (!maxCount || matchingDisks.length <= maxCount)
      })
    })

    console.log('useFilters: Filter results', {
      inputCount: servers.length,
      outputCount: filtered.length
    })
    
    return filtered
  }, [filters])

  return {
    filters,
    initialFilters,
    setFilters,
    applyFilters,
    calculateInitialFilters
  }
}