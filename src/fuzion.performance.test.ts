import { fuzion } from './fuzion';
import { map } from './map/map';
import { filter } from './filter/filter';
import { forEach } from './forEach/forEach';
import { take } from './take/take';

describe('fuzion performance tests', () => {
  // Helper to generate test data
  const generateNumbers = (size: number): number[] => {
    return Array.from({ length: size }, (_, i) => i);
  };

  const generateObjects = (size: number) => {
    return Array.from({ length: size }, (_, i) => ({
      id: i,
      value: Math.random() * 1000,
      name: `item-${i}`,
    }));
  };

  // Helper to measure performance
  const measurePerformance = <T>(
    name: string,
    fn: () => T,
    iterations = 100,
  ): { result: T; avgTime: number; minTime: number; maxTime: number } => {
    const times: number[] = [];
    let result: T;

    // Warm up
    for (let i = 0; i < 10; i++) {
      fn();
    }

    // Actual measurements
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      result = fn();
      const end = performance.now();
      times.push(end - start);
    }

    return {
      result: result!,
      avgTime: times.reduce((a, b) => a + b) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
    };
  };

  describe('Baseline comparisons', () => {
    test('fuzion vs native array methods - small dataset', () => {
      const data = generateNumbers(100);

      const nativePerf = measurePerformance('native', () =>
        data
          .map(x => x * 2)
          .filter(x => x > 50)
          .map(x => x + 1),
      );

      const fuzionPerf = measurePerformance('fuzion', () =>
        fuzion(
          data,
          map(x => x * 2),
          filter(x => x > 50),
          map(x => x + 1),
        ),
      );

      console.log('Small dataset (100 elements):');
      console.log(`Native: ${nativePerf.avgTime.toFixed(3)}ms avg`);
      console.log(`Fuzion: ${fuzionPerf.avgTime.toFixed(3)}ms avg`);
      console.log(`Ratio: ${(fuzionPerf.avgTime / nativePerf.avgTime).toFixed(2)}x`);

      expect(fuzionPerf.result).toEqual(nativePerf.result);
    });

    test('fuzion vs native array methods - large dataset', () => {
      const data = generateNumbers(100000);

      const nativePerf = measurePerformance('native', () =>
        data
          .map(x => x * 2)
          .filter(x => x > 50000)
          .map(x => x + 1),
        10, // Fewer iterations for large dataset
      );

      const fuzionPerf = measurePerformance('fuzion', () =>
        fuzion(
          data,
          map(x => x * 2),
          filter(x => x > 50000),
          map(x => x + 1),
        ),
        10,
      );

      console.log('Large dataset (100k elements):');
      console.log(`Native: ${nativePerf.avgTime.toFixed(3)}ms avg`);
      console.log(`Fuzion: ${fuzionPerf.avgTime.toFixed(3)}ms avg`);
      console.log(`Ratio: ${(fuzionPerf.avgTime / nativePerf.avgTime).toFixed(2)}x`);

      expect(fuzionPerf.result).toEqual(nativePerf.result);
    });
  });

  describe('Complex pipeline performance', () => {
    test('long pipeline with multiple operations', () => {
      const data = generateNumbers(10000);

      const complexPipeline = measurePerformance('complex', () =>
        fuzion(
          data,
          filter(x => x % 2 === 0),
          map(x => x * 3),
          filter(x => x > 1000),
          map(x => x / 2),
          filter(x => x < 10000),
          map(x => Math.floor(x)),
        ),
      );

      console.log('Complex pipeline (6 operations, 10k elements):');
      console.log(`Time: ${complexPipeline.avgTime.toFixed(3)}ms avg`);
      
      expect(complexPipeline.result).toBeDefined();
    });

    test('pipeline with early termination using take', () => {
      const data = generateNumbers(1000000);

      const withTake = measurePerformance('with-take', () =>
        fuzion(
          data,
          filter(x => x % 2 === 0),
          map(x => x * x),
          take(100),
          map(x => Math.sqrt(x)),
        ),
        10,
      );

      const withoutTake = measurePerformance('without-take', () =>
        fuzion(
          data,
          filter(x => x % 2 === 0),
          map(x => x * x),
          map(x => Math.sqrt(x)),
        ).slice(0, 100),
        10,
      );

      console.log('Early termination (1M elements, take 100):');
      console.log(`With take: ${withTake.avgTime.toFixed(3)}ms avg`);
      console.log(`Without take: ${withoutTake.avgTime.toFixed(3)}ms avg`);
      console.log(`Speedup: ${(withoutTake.avgTime / withTake.avgTime).toFixed(2)}x`);

      expect(withTake.result).toEqual(withoutTake.result);
    });
  });

  describe('Memory efficiency tests', () => {
    test('memory usage with large datasets', () => {
      const data = generateNumbers(1000000);
      
      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc();
      }

      const initialMemory = process.memoryUsage().heapUsed;

      const result = fuzion(
        data,
        map(x => ({ value: x, squared: x * x })),
        filter(obj => obj.squared > 1000),
        map(obj => obj.value),
      );

      const afterMemory = process.memoryUsage().heapUsed;
      const memoryUsed = (afterMemory - initialMemory) / 1024 / 1024;

      console.log(`Memory used for 1M element pipeline: ${memoryUsed.toFixed(2)} MB`);
      
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Type-specific optimizations', () => {
    test('number operations performance', () => {
      const data = generateNumbers(50000);

      const numberOps = measurePerformance('numbers', () =>
        fuzion(
          data,
          map(x => x * 2.5),
          filter(x => x > 25000),
          map(x => Math.floor(x)),
          map(x => x.toString()),
        ),
      );

      console.log(`Number operations (50k elements): ${numberOps.avgTime.toFixed(3)}ms`);
      expect(numberOps.result.length).toBeGreaterThan(0);
    });

    test('string operations performance', () => {
      const data = generateNumbers(10000).map(x => `string-${x}`);

      const stringOps = measurePerformance('strings', () =>
        fuzion(
          data,
          filter(s => s.includes('5')),
          map(s => s.toUpperCase()),
          filter(s => s.length > 8),
          map(s => s.replace('STRING-', '')),
        ),
      );

      console.log(`String operations (10k elements): ${stringOps.avgTime.toFixed(3)}ms`);
      expect(stringOps.result.length).toBeGreaterThan(0);
    });

    test('object operations performance', () => {
      const data = generateObjects(10000);

      const objectOps = measurePerformance('objects', () =>
        fuzion(
          data,
          filter(obj => obj.value > 500),
          map(obj => ({ ...obj, doubled: obj.value * 2 })),
          filter(obj => obj.doubled < 1500),
          map(obj => obj.id),
        ),
      );

      console.log(`Object operations (10k elements): ${objectOps.avgTime.toFixed(3)}ms`);
      expect(objectOps.result.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases and stress tests', () => {
    test('empty array performance', () => {
      const emptyPerf = measurePerformance('empty', () =>
        fuzion(
          [],
          map(x => x),
          filter(() => true),
          map(x => x),
        ),
      );

      expect(emptyPerf.avgTime).toBeLessThan(0.1);
      expect(emptyPerf.result).toEqual([]);
    });

    test('all elements filtered out', () => {
      const data = generateNumbers(10000);

      const allFiltered = measurePerformance('all-filtered', () =>
        fuzion(
          data,
          filter(() => false),
          map(x => x * 2),
          map(x => x + 1),
        ),
      );

      console.log(`All filtered (10k elements): ${allFiltered.avgTime.toFixed(3)}ms`);
      expect(allFiltered.result).toEqual([]);
    });

    test('nested array operations', () => {
      const data = generateNumbers(100).map(x => generateNumbers(100));

      const nestedOps = measurePerformance('nested', () =>
        fuzion(
          data,
          map(arr => fuzion(
            arr,
            filter(x => x > 50),
            map(x => x * 2),
          )),
          filter(arr => arr.length > 0),
          map(arr => arr.length),
        ),
      );

      console.log(`Nested operations (100x100): ${nestedOps.avgTime.toFixed(3)}ms`);
      expect(nestedOps.result.length).toBeGreaterThan(0);
    });
  });

  describe('forEach performance', () => {
    test('forEach with side effects', () => {
      const data = generateNumbers(10000);
      let sum = 0;

      const forEachPerf = measurePerformance('forEach', () => {
        sum = 0;
        return fuzion(
          data,
          filter(x => x % 2 === 0),
          forEach(x => { sum += x; }),
          map(x => x * 2),
        );
      });

      console.log(`forEach with side effects (10k elements): ${forEachPerf.avgTime.toFixed(3)}ms`);
      expect(sum).toBeGreaterThan(0);
      expect(forEachPerf.result.length).toBeGreaterThan(0);
    });
  });
});