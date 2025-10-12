import { filter } from '../filter/filter';
import { fuzion } from '../fuzion';
import { map } from '../map/map';
import { take } from '../take/take';
import {
  generateObjectData,
  generateTestData,
  getMemoryUsage,
} from './test-utils';

test('should not leak memory with repeated operations', () => {
  const initialMemory = getMemoryUsage();
  const testData = generateTestData(1000);

  for (let i = 0; i < 100; i += 1) {
    fuzion(
      testData,
      filter(x => x > 500),
      map(x => x * 2),
      filter(x => x > 1000),
    );
  }

  try {
    // @ts-ignore
    if (typeof global !== 'undefined' && global.gc) {
      // @ts-ignore
      global.gc();
    }
  } catch {}

  const finalMemory = getMemoryUsage();
  const memoryIncrease = finalMemory - initialMemory;

  expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
});

test('should handle large datasets without excessive memory usage', () => {
  const initialMemory = getMemoryUsage();
  const largeDataset = generateTestData(10000);

  const result = fuzion(
    largeDataset,
    filter(x => x % 2 === 0),
    map(x => x * 2),
    take(1000),
  );

  const peakMemory = getMemoryUsage();
  const memoryIncrease = peakMemory - initialMemory;

  expect(result.length).toBeLessThanOrEqual(1000);
  expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
});

test('should recover memory after operations complete', () => {
  const initialMemory = getMemoryUsage();
  const testData = generateTestData(5000);

  const result = fuzion(
    testData,
    filter(x => x > 1000),
    map(x => x * 3),
    filter(x => x > 3000),
  );

  try {
    // @ts-ignore
    if (typeof global !== 'undefined' && global.gc) {
      // @ts-ignore
      global.gc();
    }
  } catch {}

  const finalMemory = getMemoryUsage();
  const memoryIncrease = finalMemory - initialMemory;

  expect(result.length).toBeGreaterThan(0);
  expect(memoryIncrease).toBeLessThanOrEqual(200000);
});

test('should handle memory efficiently with object transformations', () => {
  const initialMemory = getMemoryUsage();
  const objectData = generateObjectData(2000);

  const result = fuzion(
    objectData,
    filter(item => item.active),
    map(item => ({ id: item.id, name: item.name.toUpperCase() })),
    filter(item => item.name.length > 5),
  );

  const peakMemory = getMemoryUsage();
  const memoryIncrease = peakMemory - initialMemory;

  expect(result.length).toBeGreaterThan(0);
  expect(memoryIncrease).toBeLessThan(30 * 1024 * 1024);
});

test('should not accumulate memory with chained operations', () => {
  const initialMemory = getMemoryUsage();
  const testData = generateTestData(1000);

  for (let i = 0; i < 50; i += 1) {
    const result = fuzion(
      testData,
      map(x => x + i),
      filter(x => x % 2 === 0),
      map(x => x * 2),
      filter(x => x > 100),
      take(100),
    );

    expect(result.length).toBeLessThanOrEqual(100);
  }

  try {
    // @ts-ignore
    if (typeof global !== 'undefined' && global.gc) {
      // @ts-ignore
      global.gc();
    }
  } catch {}

  const finalMemory = getMemoryUsage();
  const memoryIncrease = finalMemory - initialMemory;

  expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024);
});

test('should handle circular references without memory leaks', () => {
  const initialMemory = getMemoryUsage();
  const testData = [];

  for (let i = 0; i < 1000; i += 1) {
    const obj = { id: i, ref: null };
    testData.push(obj);
  }

  const result = fuzion(
    testData,
    filter(item => item.id % 2 === 0),
    map(item => ({ id: item.id, doubled: item.id * 2 })),
  );

  try {
    // @ts-ignore
    if (typeof global !== 'undefined' && global.gc) {
      // @ts-ignore
      global.gc();
    }
  } catch {}

  const finalMemory = getMemoryUsage();
  const memoryIncrease = finalMemory - initialMemory;

  expect(result.length).toBe(500);
  expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
});

test('should handle empty arrays without memory overhead', () => {
  const initialMemory = getMemoryUsage();
  const emptyArray: number[] = [];

  const result = fuzion(
    emptyArray,
    filter(x => x > 0),
    map(x => x * 2),
  );

  const finalMemory = getMemoryUsage();
  const memoryIncrease = finalMemory - initialMemory;

  expect(result).toEqual([]);
  expect(memoryIncrease).toBeLessThan(5000);
});

test('should handle single element arrays efficiently', () => {
  const initialMemory = getMemoryUsage();
  const singleElementArray = [42];

  const result = fuzion(
    singleElementArray,
    filter(x => x > 0),
    map(x => x * 2),
    filter(x => x > 50),
  );

  const finalMemory = getMemoryUsage();
  const memoryIncrease = finalMemory - initialMemory;

  expect(result).toEqual([84]);
  expect(memoryIncrease).toBeLessThan(5000);
});

test('should handle memory efficiently with take operations', () => {
  const initialMemory = getMemoryUsage();
  const largeDataset = generateTestData(10000);

  const result = fuzion(
    largeDataset,
    filter(x => x % 2 === 0),
    map(x => x * 2),
    take(100),
  );

  const peakMemory = getMemoryUsage();
  const memoryIncrease = peakMemory - initialMemory;

  expect(result.length).toBeLessThanOrEqual(100);
  expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024);
});

test('should handle memory efficiently with complex transformations', () => {
  const initialMemory = getMemoryUsage();
  const testData = generateTestData(5000);

  const result = fuzion(
    testData,
    map(x => x * 2),
    filter(x => x > 100),
    map(x => x.toString()),
    filter(x => x.length > 2),
    map(x => parseInt(x, 10)),
    filter(x => x > 500),
    take(200),
  );

  const peakMemory = getMemoryUsage();
  const memoryIncrease = peakMemory - initialMemory;

  expect(result.length).toBeLessThanOrEqual(200);
  expect(memoryIncrease).toBeLessThan(30 * 1024 * 1024);
});

test('should handle memory efficiently with mixed data types', () => {
  const initialMemory = getMemoryUsage();
  const mixedData = [1, 'a', 2, 'b', 3, 'c', 4, 'd', 5, 'e'];

  const result = fuzion(
    mixedData,
    filter((item): item is number => typeof item === 'number'),
    map(x => x * 2),
    filter(x => x > 5),
  );

  const finalMemory = getMemoryUsage();
  const memoryIncrease = finalMemory - initialMemory;

  expect(result).toEqual([6, 8, 10]);
  expect(memoryIncrease).toBeLessThan(5000);
});

test('should handle memory efficiently with nested object transformations', () => {
  const initialMemory = getMemoryUsage();
  const nestedData = generateObjectData(1000).map((item, index) => ({
    id: item.id,
    name: item.name,
    metadata: {
      index,
      active: item.active,
      nested: {
        value: index * 2,
        flag: index % 2 === 0,
      },
    },
  }));

  const result = fuzion(
    nestedData,
    filter(item => item.metadata.active),
    map(item => ({
      id: item.id,
      name: item.name,
      value: item.metadata.nested.value,
    })),
    filter(item => item.value > 100),
    take(50),
  );

  const peakMemory = getMemoryUsage();
  const memoryIncrease = peakMemory - initialMemory;

  expect(result.length).toBeLessThanOrEqual(50);
  expect(memoryIncrease).toBeLessThan(25 * 1024 * 1024);
});
