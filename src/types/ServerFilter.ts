interface ServerFilter {
  cpu: string;
  maxPrice: number;

  minRAM: number;
  maxRAM: number;

  minNvmeSize: number;
  maxNvmeSize: number;
  minNvmeCount: number;
  maxNvmeCount: number;

  minSataSize: number;
  maxSataSize: number;
  minSataCount: number;
  maxSataCount: number;

  minHddSize: number;
  maxHddSize: number;
  minHddCount: number;
}

// Initialize with default values to avoid undefined
export const createEmptyFilter = (): ServerFilter => ({
  cpu: '',
  maxPrice: Infinity,

  minRAM: 8, // Set minimum RAM to 8GB
  maxRAM: Infinity,

  minNvmeSize: 0,
  maxNvmeSize: Infinity,
  minNvmeCount: 0,
  maxNvmeCount: Infinity,

  minSataSize: 0,
  maxSataSize: Infinity,
  minSataCount: 0,
  maxSataCount: Infinity,

  minHddSize: 0,
  maxHddSize: Infinity,
  minHddCount: 0,
  maxHddCount: Infinity,
});

export const isFilterEmpty = (filter: ServerFilter, initialFilter: ServerFilter): boolean => {
  return (
    !filter.cpu &&
    filter.maxPrice === initialFilter.maxPrice &&
    filter.minRAM === 8 &&
    filter.maxRAM === initialFilter.maxRAM &&
    !filter.minNvmeSize &&
    !filter.minNvmeCount &&
    !filter.minSataSize &&
    !filter.minSataCount &&
    !filter.minHddSize &&
    !filter.minHddCount
  );
};

export default ServerFilter;
