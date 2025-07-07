import { fuzion } from '../src/fuzion';
import { map } from '../src/map/map';
import { filter } from '../src/filter/filter';
import { forEach } from '../src/forEach/forEach';
import { take } from '../src/take/take';

// Performance measurement utilities
interface BenchmarkResult {
  name: string;
  iterations: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
  relativeSpeed?: number;
}

class Benchmark {
  private results: BenchmarkResult[] = [];

  measure<T>(
    name: string,
    fn: () => T,
    iterations = 1000,
    warmupIterations = 100,
  ): BenchmarkResult {
    const times: number[] = [];

    // Warm up
    for (let i = 0; i < warmupIterations; i++) {
      fn();
    }

    // Actual measurements
    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      fn();
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1e6); // Convert to milliseconds
    }

    const avgTime = times.reduce((a, b) => a + b) / times.length;
    const result: BenchmarkResult = {
      name,
      iterations,
      avgTime,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      opsPerSecond: 1000 / avgTime,
    };

    this.results.push(result);
    return result;
  }

  compareResults(baseline: string) {
    const baselineResult = this.results.find(r => r.name === baseline);
    if (!baselineResult) return;

    this.results.forEach(result => {
      if (result.name !== baseline) {
        result.relativeSpeed = baselineResult.avgTime / result.avgTime;
      }
    });
  }

  printResults() {
    console.log('\n=== Benchmark Results ===\n');
    console.table(
      this.results.map(r => ({
        Name: r.name,
        'Avg Time (ms)': r.avgTime.toFixed(4),
        'Min Time (ms)': r.minTime.toFixed(4),
        'Max Time (ms)': r.maxTime.toFixed(4),
        'Ops/sec': Math.round(r.opsPerSecond),
        'Relative Speed': r.relativeSpeed?.toFixed(2) + 'x' || 'baseline',
      }))
    );
  }
}

// Data generators
const generateNumbers = (size: number): number[] => {
  return Array.from({ length: size }, (_, i) => i);
};

const generateRandomNumbers = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.random() * 1000);
};

const generateObjects = (size: number) => {
  return Array.from({ length: size }, (_, i) => ({
    id: i,
    value: Math.random() * 1000,
    name: `item-${i}`,
    category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
  }));
};

// Benchmark scenarios
console.log('Starting Fuzion Performance Benchmarks...\n');

// Scenario 1: Simple pipeline comparison
console.log('1. Simple Pipeline (map -> filter -> map)');
{
  const bench = new Benchmark();
  const data = generateNumbers(10000);

  bench.measure('Native Array Methods', () => {
    return data
      .map(x => x * 2)
      .filter(x => x > 5000)
      .map(x => x + 1);
  });

  bench.measure('Fuzion', () => {
    return fuzion(
      data,
      map(x => x * 2),
      filter(x => x > 5000),
      map(x => x + 1),
    );
  });

  bench.compareResults('Native Array Methods');
  bench.printResults();
}

// Scenario 2: Complex pipeline
console.log('\n2. Complex Pipeline (6 operations)');
{
  const bench = new Benchmark();
  const data = generateRandomNumbers(10000);

  bench.measure('Native Array Methods', () => {
    return data
      .filter(x => x > 200)
      .map(x => x * 2)
      .filter(x => x < 1500)
      .map(x => Math.floor(x))
      .filter(x => x % 2 === 0)
      .map(x => x / 2);
  });

  bench.measure('Fuzion', () => {
    return fuzion(
      data,
      filter(x => x > 200),
      map(x => x * 2),
      filter(x => x < 1500),
      map(x => Math.floor(x)),
      filter(x => x % 2 === 0),
      map(x => x / 2),
    );
  });

  bench.compareResults('Native Array Methods');
  bench.printResults();
}

// Scenario 3: Large dataset
console.log('\n3. Large Dataset (100k elements)');
{
  const bench = new Benchmark();
  const data = generateNumbers(100000);

  bench.measure('Native Array Methods', () => {
    return data
      .map(x => x * 3)
      .filter(x => x > 150000)
      .map(x => x - 100000);
  }, 100, 10);

  bench.measure('Fuzion', () => {
    return fuzion(
      data,
      map(x => x * 3),
      filter(x => x > 150000),
      map(x => x - 100000),
    );
  }, 100, 10);

  bench.compareResults('Native Array Methods');
  bench.printResults();
}

// Scenario 4: Early termination with take
console.log('\n4. Early Termination (1M elements, take 1000)');
{
  const bench = new Benchmark();
  const data = generateNumbers(1000000);

  bench.measure('Native slice(0, 1000)', () => {
    return data
      .filter(x => x % 2 === 0)
      .map(x => x * x)
      .slice(0, 1000);
  }, 50, 5);

  bench.measure('Fuzion with take', () => {
    return fuzion(
      data,
      filter(x => x % 2 === 0),
      take(1000),
      map(x => x * x),
    );
  }, 50, 5);

  bench.compareResults('Native slice(0, 1000)');
  bench.printResults();
}

// Scenario 5: Object transformations
console.log('\n5. Object Transformations');
{
  const bench = new Benchmark();
  const data = generateObjects(5000);

  bench.measure('Native Array Methods', () => {
    return data
      .filter(obj => obj.category === 'A')
      .map(obj => ({ ...obj, value: obj.value * 2 }))
      .filter(obj => obj.value > 500)
      .map(obj => obj.id);
  });

  bench.measure('Fuzion', () => {
    return fuzion(
      data,
      filter(obj => obj.category === 'A'),
      map(obj => ({ ...obj, value: obj.value * 2 })),
      filter(obj => obj.value > 500),
      map(obj => obj.id),
    );
  });

  bench.compareResults('Native Array Methods');
  bench.printResults();
}

// Scenario 6: Heavy filtering (most elements removed)
console.log('\n6. Heavy Filtering (90% elements filtered)');
{
  const bench = new Benchmark();
  const data = generateRandomNumbers(10000);

  bench.measure('Native Array Methods', () => {
    return data
      .filter(x => x > 900) // ~10% pass
      .map(x => x * 2)
      .filter(x => x > 1850) // ~50% of remaining pass
      .map(x => Math.floor(x));
  });

  bench.measure('Fuzion', () => {
    return fuzion(
      data,
      filter(x => x > 900),
      map(x => x * 2),
      filter(x => x > 1850),
      map(x => Math.floor(x)),
    );
  });

  bench.compareResults('Native Array Methods');
  bench.printResults();
}

// Memory usage analysis
console.log('\n7. Memory Usage Analysis');
{
  const size = 1000000;
  const data = generateNumbers(size);

  // Force GC if available
  if ((global as any).gc) {
    (global as any).gc();
  }

  const memBefore = process.memoryUsage();

  // Native methods (creates intermediate arrays)
  const native = data
    .map(x => x * 2)
    .filter(x => x > 500000)
    .map(x => ({ value: x, squared: x * x }))
    .filter(obj => obj.squared < 4e11)
    .map(obj => obj.value);

  const memAfterNative = process.memoryUsage();

  // Force GC again
  if ((global as any).gc) {
    (global as any).gc();
  }

  // Fuzion (no intermediate arrays)
  const fuzionResult = fuzion(
    data,
    map(x => x * 2),
    filter(x => x > 500000),
    map(x => ({ value: x, squared: x * x })),
    filter(obj => obj.squared < 4e11),
    map(obj => obj.value),
  );

  const memAfterFuzion = process.memoryUsage();

  console.log('Memory Usage (MB):');
  console.log(`  Native methods: ${((memAfterNative.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Fuzion:         ${((memAfterFuzion.heapUsed - memAfterNative.heapUsed) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Result lengths: Native=${native.length}, Fuzion=${fuzionResult.length}`);
}

// JIT optimization analysis
console.log('\n8. JIT Optimization Analysis');
{
  const bench = new Benchmark();
  const data = generateNumbers(5000);

  // Run the same operation many times to trigger JIT optimization
  console.log('  Testing JIT warm-up effect...');

  for (let i = 0; i < 5; i++) {
    bench.measure(`Fuzion - Run ${i + 1}`, () => {
      return fuzion(
        data,
        filter(x => x % 2 === 0),
        map(x => x * 3),
        filter(x => x > 5000),
        map(x => x / 2),
      );
    }, 100, 0); // No warmup to see JIT effect
  }

  bench.printResults();
}

console.log('\n=== Benchmark Complete ===\n');