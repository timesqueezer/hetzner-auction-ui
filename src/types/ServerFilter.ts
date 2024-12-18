type ServerFilter = {
  cpu: string;
  minRAM: number;
  maxRAM: number;
  maxPrice: number;
  minStorage: number;
  diskType: string;
  minDiskSize: number;
  minDiskCount: number;
  maxDiskCount: number;
  hddMinDiskSize: number;
  hddMinDiskCount: number;
  hddMaxDiskCount: number;
}

export default ServerFilter
