import { useState, useCallback, useEffect, useRef } from 'react'
import axios from 'axios'
import HetznerServer from '../types/HetznerServer'
import ServerFilter from '../types/ServerFilter'

interface UseServerDataResult {
  servers: HetznerServer[]
  filteredServers: HetznerServer[]
  loading: boolean
  error: string | null
  fetchData: () => Promise<void>
  setFilteredServers: (servers: HetznerServer[]) => void
}

export function useServerData(): UseServerDataResult {
  const [servers, setServers] = useState<HetznerServer[]>([])
  const [filteredServers, setFilteredServers] = useState<HetznerServer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortController = useRef<AbortController>()

  const fetchData = useCallback(async () => {
    if (abortController.current) {
      abortController.current.abort()
    }
    abortController.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const { data } = await axios.get(
        "https://www.hetzner.com/_resources/app/data/app/live_data_sb_EUR.json",
        {
          signal: abortController.current.signal,
          timeout: 10000
        }
      )

      if (data?.server?.length) {
        const serverList = data.server.sort((a: HetznerServer, b: HetznerServer) => a.price - b.price)
        setServers(serverList)
        setFilteredServers(serverList)
      } else {
        throw new Error('No server data available')
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        return
      }
      const message = error instanceof Error ? error.message : 'Failed to load server data'
      setError(message)
      if (!servers.length) {
        setServers([])
        setFilteredServers([])
      }
    } finally {
      setLoading(false)
    }
  }, [servers.length])

  useEffect(() => {
    fetchData()
    return () => {
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