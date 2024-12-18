type HetznerServer = {
  id: number
  key: number
  name: string
  description: string[]
  information: string[]
  category: string
  cat_id: number
  cpu: string
  cpu_count: number
  is_highio: boolean
  traffic: string
  bandwidth: number
  ram: string[]
  ram_size: number
  price: number
  setup_price: number
  hourly_price: number
  hdd_arr: string[]
  hdd_hr: string[]
  hdd_size: number
  hdd_count: number
  serverDiskData: {
    nvme: number[]
    sata: number[]
    hdd: number[]
    general: number[]
  }
  is_ecc: boolean
  datacenter: string
  datacenter_hr: string
  specials: string[]
  dist: string[]
  fixed_price: boolean
  next_reduce: number
  next_reduce_hr: boolean
  next_reduce_timestamp: number
  ip_price: {
    Monthly: number
    Hourly: number
    Amount: number
  }
}