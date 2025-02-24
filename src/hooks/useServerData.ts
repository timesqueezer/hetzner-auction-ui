import { useState, useCallback, useEffect, useRef } from 'react'
import axios from 'axios'
import HetznerServer from '../types/HetznerServer'
import ServerFilter from '../types/ServerFilter'
import { mockServerData } from '../mocks/serverData'

interface UseServerDataResult {
  servers: HetznerServer[]
  filteredServers: HetznerServer[]
  loading: boolean
  error: string | null
  fetchData: () => Promise<void>
  setFilteredServers: (servers: HetznerServer[]) => void
}

export function useServerData(): UseServerDataResult {
  console.log('useServerData: Hook initializing')
  
  const [servers, setServers] = useState<HetznerServer[]>([])
  const [filteredServers, setFilteredServers] = useState<HetznerServer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortController = useRef<AbortController>()
  const isFirstLoad = useRef(true)
  const retryCount = useRef(0)
  const isMounted = useRef(true)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  const processServerData = useCallback((serverData: any[]): HetznerServer[] => {
    return serverData.map(server => ({
      ...server,
      hdd_arr: server.hdd_arr || [],
      hdd_hr: server.hdd_hr || [],
      hdd_size: server.hdd_size || 0,
      hdd_count: server.hdd_count || 0,
      serverDiskData: {
        nvme: server.serverDiskData?.nvme || [],
        sata: server.serverDiskData?.sata || [],
        hdd: server.serverDiskData?.hdd || []
      }
    })).sort((a, b) => a.price - b.price)
  }, [])

  const fetchData = useCallback(async () => {
    if (!isMounted.current) return

    console.log('useServerData: Starting fetch')
    if (abortController.current) {
      abortController.current.abort()
    }
    abortController.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      console.log('useServerData: Making API request, attempt', retryCount.current + 1)
      const response = await axios.get<{ server: any[] }>(
        "/api/_resources/app/data/app/live_data_sb_EUR.json",
        {
          signal: abortController.current.signal,
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      )

      if (!isMounted.current) return

      console.log('useServerData: Response received', {
        status: response.status,
        hasData: !!response.data,
        serverCount: response.data?.server?.length,
        contentType: response.headers['content-type']
      })

      if (!response.data?.server?.length) {
        throw new Error('No server data available')
      }

      const serverList = processServerData(response.data.server)

      if (!isMounted.current) return

      console.log('useServerData: Processed server list', {
        originalCount: response.data.server.length,
        processedCount: serverList.length,
        firstServer: serverList[0] ? {
          id: serverList[0].id,
          price: serverList[0].price
        } : null
      })

      setServers(serverList)
      if (isFirstLoad.current) {
        setFilteredServers(serverList)
        isFirstLoad.current = false
      }
    } catch (error) {
      if (!isMounted.current) return

      console.error('useServerData: Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        isAxiosError: axios.isAxiosError(error),
        response: axios.isAxiosError(error) ? error.response?.status : null
      })

      if (axios.isCancel(error)) {
        console.log('useServerData: Request cancelled')
        return
      }

      // Use mock data after 2 failed attempts
      if (retryCount.current >= 2) {
        console.log('useServerData: Using mock data after failed attempts')
        const mockList = processServerData(mockServerData.server)
        setServers(mockList)
        if (isFirstLoad.current) {
          setFilteredServers(mockList)
          isFirstLoad.current = false
        }
        setError('Using demo data - Could not connect to Hetzner API')
        return
      }

      retryCount.current++
      const message = error instanceof Error ? error.message : 'Failed to load server data'
      setError(message)
      
      if (isMounted.current) {
        // Schedule a retry
        setTimeout(() => {
          if (isMounted.current) {
            fetchData()
          }
        }, 2000)
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [processServerData])

  useEffect(() => {
    console.log('useServerData: Initial fetch effect')
    fetchData()
    return () => {
      isMounted.current = false
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [fetchData])

  return {
    servers,
    filteredServers,
    loading,
    error,
    fetchData,
    setFilteredServers
  }
}