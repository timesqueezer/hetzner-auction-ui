export const mockServerData = {
  server: [
    {
      id: "mock1",
      key: 1,
      name: "AX41-NVMe",
      description: ["AMD Ryzen 5 3600", "64 GB DDR4", "2x 512GB NVMe"],
      information: [],
      category: "Server",
      cat_id: 1,
      cpu: "AMD Ryzen 5 3600",
      cpu_count: 1,
      is_highio: true,
      traffic: "Unlimited",
      bandwidth: 1000,
      ram: ["64 GB DDR4"],
      ram_size: 64,
      price: 39,
      setup_price: 0,
      hourly_price: 0.059,
      serverDiskData: {
        nvme: [512, 512],
        sata: [],
        hdd: []
      },
      is_ecc: true,
      datacenter: "FSN1-DC8",
      datacenter_hr: "Falkenstein DC8",
      specials: [],
      dist: ["Ubuntu 22.04"],
      fixed_price: true,
      next_reduce: 0,
      next_reduce_hr: false,
      next_reduce_timestamp: 0,
      ip_price: {
        Monthly: 1,
        Hourly: 0.001,
        Amount: 1
      }
    },
    {
      id: "mock2",
      key: 2,
      name: "AX51-SATA",
      description: ["AMD Ryzen 7 3700X", "128 GB DDR4", "2x 1TB SATA"],
      information: [],
      category: "Server",
      cat_id: 1,
      cpu: "AMD Ryzen 7 3700X",
      cpu_count: 1,
      is_highio: true,
      traffic: "Unlimited",
      bandwidth: 1000,
      ram: ["128 GB DDR4"],
      ram_size: 128,
      price: 55,
      setup_price: 0,
      hourly_price: 0.082,
      serverDiskData: {
        nvme: [],
        sata: [1000, 1000],
        hdd: []
      },
      is_ecc: true,
      datacenter: "FSN1-DC8",
      datacenter_hr: "Falkenstein DC8",
      specials: [],
      dist: ["Ubuntu 22.04"],
      fixed_price: true,
      next_reduce: 0,
      next_reduce_hr: false,
      next_reduce_timestamp: 0,
      ip_price: {
        Monthly: 1,
        Hourly: 0.001,
        Amount: 1
      }
    }
  ]
}