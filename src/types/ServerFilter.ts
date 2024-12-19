type ServerFilter = {
  cpu: string
  maxPrice: number

  minRAM: number
  maxRAM: number

  minNvmeSize: number
  maxNvmeSize: number
  minNvmeCount: number
  maxNvmeCount: number

  minSataSize: number
  maxSataSize: number
  minSataCount: number
  maxSataCount: number

  minHddSize: number
  maxHddSize: number
  minHddCount: number
  maxHddCount: number
}

export default ServerFilter
