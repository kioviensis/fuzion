import { filter } from '../filter/filter';
import { fuzion } from '../fuzion';
import { map } from '../map/map';
import { take } from '../take/take';

const testArray = Array.from({ length: 10000 }, (_, i) => i + 1);
const iterations = 1000;

function scientificBenchmark(_: string, fn: () => any) {
  // Warmup
  for (let i = 0; i < 100; i += 1) {
    fn();
  }

  const times: number[] = [];
  for (let i = 0; i < iterations; i += 1) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  const sorted = times.slice().sort((a, b) => a - b);
  const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const stdDev = Math.sqrt(
    times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) /
      times.length,
  );
  const cv = (stdDev / mean) * 100;

  return { mean, median, stdDev, cv };
}

test('MAP + MAP + FILTER: Honest comparison of all approaches', () => {
  console.log('\n=== MAP + MAP + FILTER: Honest Performance Comparison ===');

  const manualTime = scientificBenchmark('Manual Single Loop', () => {
    const result = [];
    for (let i = 0; i < testArray.length; i += 1) {
      const x = testArray[i];
      const step1 = x * 2;
      const step2 = step1 + 1;
      if (step2 > 5) {
        result.push(step2);
      }
    }
    return result;
  });

  const chainedTime = scientificBenchmark('Chained Native', () => {
    return testArray
      .map(x => x * 2)
      .map(x => x + 1)
      .filter(x => x > 5);
  });

  const fuzionTime = scientificBenchmark('Fuzion', () => {
    return fuzion(
      testArray,
      map(x => x * 2),
      map(x => x + 1),
      filter(x => x > 5),
    );
  });

  console.log(
    `Manual Single Loop: ${manualTime.mean.toFixed(2)}ms (median: ${manualTime.median.toFixed(2)}ms)`,
  );
  console.log(
    `Chained Native: ${chainedTime.mean.toFixed(2)}ms (median: ${chainedTime.median.toFixed(2)}ms)`,
  );
  console.log(
    `Fuzion: ${fuzionTime.mean.toFixed(2)}ms (median: ${fuzionTime.median.toFixed(2)}ms)`,
  );

  const chainedToManual = chainedTime.mean / manualTime.mean;
  const fuzionToManual = fuzionTime.mean / manualTime.mean;
  const fuzionToChained = fuzionTime.mean / chainedTime.mean;

  console.log(`\nPerformance ratios:`);
  console.log(
    `Chained vs Manual: ${chainedToManual > 1 ? `${chainedToManual.toFixed(2)}x slower` : `${(1 / chainedToManual).toFixed(2)}x faster`}`,
  );
  console.log(
    `Fuzion vs Manual: ${fuzionToManual > 1 ? `${fuzionToManual.toFixed(2)}x slower` : `${(1 / fuzionToManual).toFixed(2)}x faster`}`,
  );
  console.log(
    `Fuzion vs Chained: ${fuzionToChained > 1 ? `${fuzionToChained.toFixed(2)}x slower` : `${(1 / fuzionToChained).toFixed(2)}x faster`}`,
  );

  const manualResult = (() => {
    const result = [];
    for (let i = 0; i < testArray.length; i += 1) {
      const x = testArray[i];
      const step1 = x * 2;
      const step2 = step1 + 1;
      if (step2 > 5) {
        result.push(step2);
      }
    }
    return result;
  })();

  const chainedResult = testArray
    .map(x => x * 2)
    .map(x => x + 1)
    .filter(x => x > 5);
  const fuzionResult = fuzion(
    testArray,
    map(x => x * 2),
    map(x => x + 1),
    filter(x => x > 5),
  );

  expect(manualResult).toEqual(chainedResult);
  expect(chainedResult).toEqual(fuzionResult);

  expect(fuzionTime.mean).toBeLessThan(manualTime.mean * 20); // Allow up to 20x slower
  expect(fuzionTime.mean).toBeLessThan(chainedTime.mean * 5); // Allow up to 5x slower than chained
});

test('MAP-only chain: Where fuzion should perform better', () => {
  console.log('\n=== MAP + MAP + MAP: MAP-only chain comparison ===');

  const manualTime = scientificBenchmark('Manual Single Loop', () => {
    const result = new Array(testArray.length);
    for (let i = 0; i < testArray.length; i += 1) {
      const x = testArray[i];
      const step1 = x * 2;
      const step2 = step1 + 1;
      result[i] = step2 * 3;
    }
    return result;
  });

  const chainedTime = scientificBenchmark('Chained Native', () => {
    return testArray
      .map(x => x * 2)
      .map(x => x + 1)
      .map(x => x * 3);
  });

  const fuzionTime = scientificBenchmark('Fuzion', () => {
    return fuzion(
      testArray,
      map(x => x * 2),
      map(x => x + 1),
      map(x => x * 3),
    );
  });

  console.log(
    `Manual Single Loop: ${manualTime.mean.toFixed(2)}ms (median: ${manualTime.median.toFixed(2)}ms)`,
  );
  console.log(
    `Chained Native: ${chainedTime.mean.toFixed(2)}ms (median: ${chainedTime.median.toFixed(2)}ms)`,
  );
  console.log(
    `Fuzion: ${fuzionTime.mean.toFixed(2)}ms (median: ${fuzionTime.median.toFixed(2)}ms)`,
  );

  const chainedToManual = chainedTime.mean / manualTime.mean;
  const fuzionToManual = fuzionTime.mean / manualTime.mean;
  const fuzionToChained = fuzionTime.mean / chainedTime.mean;

  console.log(`\nPerformance ratios:`);
  console.log(
    `Chained vs Manual: ${chainedToManual > 1 ? `${chainedToManual.toFixed(2)}x slower` : `${(1 / chainedToManual).toFixed(2)}x faster`}`,
  );
  console.log(
    `Fuzion vs Manual: ${fuzionToManual > 1 ? `${fuzionToManual.toFixed(2)}x slower` : `${(1 / fuzionToManual).toFixed(2)}x faster`}`,
  );
  console.log(
    `Fuzion vs Chained: ${fuzionToChained > 1 ? `${fuzionToChained.toFixed(2)}x slower` : `${(1 / fuzionToChained).toFixed(2)}x faster`}`,
  );

  const manualResult = (() => {
    const result = new Array(testArray.length);
    for (let i = 0; i < testArray.length; i += 1) {
      const x = testArray[i];
      const step1 = x * 2;
      const step2 = step1 + 1;
      result[i] = step2 * 3;
    }
    return result;
  })();

  const chainedResult = testArray
    .map(x => x * 2)
    .map(x => x + 1)
    .map(x => x * 3);
  const fuzionResult = fuzion(
    testArray,
    map(x => x * 2),
    map(x => x + 1),
    map(x => x * 3),
  );

  expect(manualResult).toEqual(chainedResult);
  expect(chainedResult).toEqual(fuzionResult);

  expect(fuzionTime.mean).toBeLessThan(manualTime.mean * 20); // Allow up to 20x slower than manual
  expect(fuzionTime.mean).toBeLessThan(chainedTime.mean * 2); // Should be competitive with chained
});

test('TAKE operator: Where fuzion should excel', () => {
  console.log('\n=== TAKE operator: Early exit optimization ===');

  const manualTime = scientificBenchmark('Manual with Early Exit', () => {
    const result = [];
    for (let i = 0; i < testArray.length; i += 1) {
      const x = testArray[i];
      const step1 = x * 2;
      const step2 = step1 + 1;
      if (step2 > 5) {
        result.push(step2);
      }
      if (result.length >= 100) break;
    }
    return result.slice(0, 100);
  });

  const chainedTime = scientificBenchmark('Chained Native', () => {
    return testArray
      .map(x => x * 2)
      .map(x => x + 1)
      .filter(x => x > 5)
      .slice(0, 100);
  });

  const fuzionTime = scientificBenchmark('Fuzion with Take', () => {
    return fuzion(
      testArray,
      map(x => x * 2),
      map(x => x + 1),
      filter(x => x > 5),
      take(100),
    );
  });

  console.log(
    `Manual with Early Exit: ${manualTime.mean.toFixed(2)}ms (median: ${manualTime.median.toFixed(2)}ms)`,
  );
  console.log(
    `Chained Native: ${chainedTime.mean.toFixed(2)}ms (median: ${chainedTime.median.toFixed(2)}ms)`,
  );
  console.log(
    `Fuzion with Take: ${fuzionTime.mean.toFixed(2)}ms (median: ${fuzionTime.median.toFixed(2)}ms)`,
  );

  const chainedToManual = chainedTime.mean / manualTime.mean;
  const fuzionToManual = fuzionTime.mean / manualTime.mean;
  const fuzionToChained = fuzionTime.mean / chainedTime.mean;

  console.log(`\nPerformance ratios:`);
  console.log(
    `Chained vs Manual: ${chainedToManual > 1 ? `${chainedToManual.toFixed(2)}x slower` : `${(1 / chainedToManual).toFixed(2)}x faster`}`,
  );
  console.log(
    `Fuzion vs Manual: ${fuzionToManual > 1 ? `${fuzionToManual.toFixed(2)}x slower` : `${(1 / fuzionToManual).toFixed(2)}x faster`}`,
  );
  console.log(
    `Fuzion vs Chained: ${fuzionToChained > 1 ? `${fuzionToChained.toFixed(2)}x slower` : `${(1 / fuzionToChained).toFixed(2)}x faster`}`,
  );

  const manualResult = (() => {
    const result = [];
    for (let i = 0; i < testArray.length; i += 1) {
      const x = testArray[i];
      const step1 = x * 2;
      const step2 = step1 + 1;
      if (step2 > 5) {
        result.push(step2);
      }
      if (result.length >= 100) break;
    }
    return result.slice(0, 100);
  })();

  const chainedResult = testArray
    .map(x => x * 2)
    .map(x => x + 1)
    .filter(x => x > 5)
    .slice(0, 100);
  const fuzionResult = fuzion(
    testArray,
    map(x => x * 2),
    map(x => x + 1),
    filter(x => x > 5),
    take(100),
  );

  expect(manualResult.length).toBeLessThanOrEqual(100);
  expect(chainedResult.length).toBeLessThanOrEqual(100);
  expect(fuzionResult.length).toBeLessThanOrEqual(100);

  expect(manualResult.length).toBeGreaterThan(0);
  expect(chainedResult.length).toBeGreaterThan(0);
  expect(fuzionResult.length).toBeGreaterThan(0);

  expect(fuzionTime.mean).toBeLessThan(manualTime.mean * 10); // Allow up to 10x slower
  expect(fuzionTime.mean).toBeLessThan(chainedTime.mean * 0.5); // Should be faster than chained
});

test('Single MAP operation: Baseline comparison', () => {
  console.log('\n=== Single MAP: Baseline performance ===');

  const manualTime = scientificBenchmark('Manual Single Loop', () => {
    const result = new Array(testArray.length);
    for (let i = 0; i < testArray.length; i += 1) {
      result[i] = testArray[i] * 2;
    }
    return result;
  });

  const chainedTime = scientificBenchmark('Chained Native', () => {
    return testArray.map(x => x * 2);
  });

  const fuzionTime = scientificBenchmark('Fuzion', () => {
    return fuzion(
      testArray,
      map(x => x * 2),
    );
  });

  console.log(
    `Manual Single Loop: ${manualTime.mean.toFixed(2)}ms (median: ${manualTime.median.toFixed(2)}ms)`,
  );
  console.log(
    `Chained Native: ${chainedTime.mean.toFixed(2)}ms (median: ${chainedTime.median.toFixed(2)}ms)`,
  );
  console.log(
    `Fuzion: ${fuzionTime.mean.toFixed(2)}ms (median: ${fuzionTime.median.toFixed(2)}ms)`,
  );

  const chainedToManual = chainedTime.mean / manualTime.mean;
  const fuzionToManual = fuzionTime.mean / manualTime.mean;
  const fuzionToChained = fuzionTime.mean / chainedTime.mean;

  console.log(`\nPerformance ratios:`);
  console.log(
    `Chained vs Manual: ${chainedToManual > 1 ? `${chainedToManual.toFixed(2)}x slower` : `${(1 / chainedToManual).toFixed(2)}x faster`}`,
  );
  console.log(
    `Fuzion vs Manual: ${fuzionToManual > 1 ? `${fuzionToManual.toFixed(2)}x slower` : `${(1 / fuzionToManual).toFixed(2)}x faster`}`,
  );
  console.log(
    `Fuzion vs Chained: ${fuzionToChained > 1 ? `${fuzionToChained.toFixed(2)}x slower` : `${(1 / fuzionToChained).toFixed(2)}x faster`}`,
  );

  const manualResult = (() => {
    const result = new Array(testArray.length);
    for (let i = 0; i < testArray.length; i += 1) {
      result[i] = testArray[i] * 2;
    }
    return result;
  })();

  const chainedResult = testArray.map(x => x * 2);
  const fuzionResult = fuzion(
    testArray,
    map(x => x * 2),
  );

  expect(manualResult).toEqual(chainedResult);
  expect(chainedResult).toEqual(fuzionResult);

  expect(fuzionTime.mean).toBeLessThan(manualTime.mean * 15); // Allow up to 15x slower
  expect(fuzionTime.mean).toBeLessThan(chainedTime.mean * 3); // Should be competitive with chained
});

test('Single FILTER operation: Baseline comparison', () => {
  console.log('\n=== Single FILTER: Baseline performance ===');

  const manualTime = scientificBenchmark('Manual Single Loop', () => {
    const result = [];
    for (let i = 0; i < testArray.length; i += 1) {
      if (testArray[i] % 2 === 0) {
        result.push(testArray[i]);
      }
    }
    return result;
  });

  const chainedTime = scientificBenchmark('Chained Native', () => {
    return testArray.filter(x => x % 2 === 0);
  });

  const fuzionTime = scientificBenchmark('Fuzion', () => {
    return fuzion(
      testArray,
      filter(x => x % 2 === 0),
    );
  });

  console.log(
    `Manual Single Loop: ${manualTime.mean.toFixed(2)}ms (median: ${manualTime.median.toFixed(2)}ms)`,
  );
  console.log(
    `Chained Native: ${chainedTime.mean.toFixed(2)}ms (median: ${chainedTime.median.toFixed(2)}ms)`,
  );
  console.log(
    `Fuzion: ${fuzionTime.mean.toFixed(2)}ms (median: ${fuzionTime.median.toFixed(2)}ms)`,
  );

  const chainedToManual = chainedTime.mean / manualTime.mean;
  const fuzionToManual = fuzionTime.mean / manualTime.mean;
  const fuzionToChained = fuzionTime.mean / chainedTime.mean;

  console.log(`\nPerformance ratios:`);
  console.log(
    `Chained vs Manual: ${chainedToManual > 1 ? `${chainedToManual.toFixed(2)}x slower` : `${(1 / chainedToManual).toFixed(2)}x faster`}`,
  );
  console.log(
    `Fuzion vs Manual: ${fuzionToManual > 1 ? `${fuzionToManual.toFixed(2)}x slower` : `${(1 / fuzionToManual).toFixed(2)}x faster`}`,
  );
  console.log(
    `Fuzion vs Chained: ${fuzionToChained > 1 ? `${fuzionToChained.toFixed(2)}x slower` : `${(1 / fuzionToChained).toFixed(2)}x faster`}`,
  );

  const manualResult = (() => {
    const result = [];
    for (let i = 0; i < testArray.length; i += 1) {
      if (testArray[i] % 2 === 0) {
        result.push(testArray[i]);
      }
    }
    return result;
  })();

  const chainedResult = testArray.filter(x => x % 2 === 0);
  const fuzionResult = fuzion(
    testArray,
    filter(x => x % 2 === 0),
  );

  expect(manualResult).toEqual(chainedResult);
  expect(chainedResult).toEqual(fuzionResult);

  expect(fuzionTime.mean).toBeLessThan(manualTime.mean * 15); // Allow up to 15x slower
  expect(fuzionTime.mean).toBeLessThan(chainedTime.mean * 3); // Should be competitive with chained
});
