export interface PerformanceTestConfig {
  iterations: number;
  arraySize: number;
  warmupRuns: number;
}

export interface BenchmarkResult {
  method: string;
  averageTime: number;
  minTime: number;
  maxTime: number;
  totalTime: number;
  iterations: number;
  memoryUsage?: {
    before: number;
    after: number;
    peak: number;
  };
}

export function getMemoryUsage(): number {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.memoryUsage) {
      // @ts-ignore
      return process.memoryUsage().heapUsed;
    }
  } catch {}

  return 0;
}

export function measurePerformance<T>(
  fn: () => T,
  iterations: number = 1000,
  warmupRuns: number = 10,
): BenchmarkResult {
  for (let i = 0; i < warmupRuns; i += 1) {
    fn();
  }

  const times: number[] = [];
  const memoryBefore = getMemoryUsage();
  let peakMemory = memoryBefore;

  const startTime = performance.now();

  for (let i = 0; i < iterations; i += 1) {
    const iterStart = performance.now();

    fn();

    const iterEnd = performance.now();

    times.push(iterEnd - iterStart);

    const currentMemory = getMemoryUsage();
    if (currentMemory > peakMemory) {
      peakMemory = currentMemory;
    }
  }

  const endTime = performance.now();
  const memoryAfter = getMemoryUsage();

  const sortedTimes = times.sort((a, b) => a - b);

  return {
    method: fn.name || 'anonymous',
    averageTime: sortedTimes.reduce((a, b) => a + b, 0) / times.length,
    minTime: sortedTimes[0],
    maxTime: sortedTimes[sortedTimes.length - 1],
    totalTime: endTime - startTime,
    iterations,
    memoryUsage: {
      before: memoryBefore,
      after: memoryAfter,
      peak: peakMemory,
    },
  };
}

export function generateTestData(size: number): number[] {
  return Array.from({ length: size }, (_, i) => i + 1);
}

export function generateMixedData(size: number): (string | number)[] {
  return Array.from({ length: size }, (_, i) =>
    i % 2 === 0 ? i : `item-${i}`,
  );
}

export function generateObjectData(
  size: number,
): Array<{ id: number; name: string; active: boolean }> {
  return Array.from({ length: size }, (_, i) => ({
    id: i + 1,
    name: `Item: ${i + 1}`,
    active: i % 2 === 0,
  }));
}
