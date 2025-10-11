import { filter } from '../filter/filter';
import { fuzion } from '../fuzion';
import { map } from '../map/map';
import {
  PerformanceTestConfig,
  generateMixedData,
  generateObjectData,
  generateTestData,
  measurePerformance,
} from './test-utils';

const config: PerformanceTestConfig = {
  iterations: 100000,
  arraySize: 1000,
  warmupRuns: 10,
};

test('map(x => x * 2) - 100K iterations', () => {
  const testData = generateTestData(config.arraySize);

  const nativeArrayResult = measurePerformance(
    () => {
      return testData.map(x => x * 2);
    },
    config.iterations,
    config.warmupRuns,
  );

  const nativeForOfResult = measurePerformance(
    () => {
      const result = [];
      for (const item of testData) {
        result.push(item * 2);
      }
      return result;
    },
    config.iterations,
    config.warmupRuns,
  );

  const nativeForResult = measurePerformance(
    () => {
      const result = [];
      for (let i = 0; i < testData.length; i++) {
        result.push(testData[i] * 2);
      }
      return result;
    },
    config.iterations,
    config.warmupRuns,
  );

  const fuzionResult = measurePerformance(
    () => {
      return fuzion(
        testData,
        map(x => x * 2),
      );
    },
    config.iterations,
    config.warmupRuns,
  );

  expect(fuzionResult.averageTime).toBeLessThan(
    nativeArrayResult.averageTime * 10,
  );
  expect(fuzionResult.averageTime).toBeLessThan(
    nativeForOfResult.averageTime * 15,
  );
  expect(fuzionResult.averageTime).toBeLessThan(
    nativeForResult.averageTime * 20,
  );
});

test('filter(x => x % 2 === 0) - 100K iterations', () => {
  const testData = generateTestData(config.arraySize);

  const nativeArrayResult = measurePerformance(
    () => {
      return testData.filter(x => x % 2 === 0);
    },
    config.iterations,
    config.warmupRuns,
  );

  const nativeForOfResult = measurePerformance(
    () => {
      const result = [];
      for (const item of testData) {
        if (item % 2 === 0) {
          result.push(item);
        }
      }
      return result;
    },
    config.iterations,
    config.warmupRuns,
  );

  const nativeForResult = measurePerformance(
    () => {
      const result = [];
      for (let i = 0; i < testData.length; i++) {
        if (testData[i] % 2 === 0) {
          result.push(testData[i]);
        }
      }
      return result;
    },
    config.iterations,
    config.warmupRuns,
  );

  const fuzionResult = measurePerformance(
    () => {
      return fuzion(
        testData,
        filter(x => x % 2 === 0),
      );
    },
    config.iterations,
    config.warmupRuns,
  );

  expect(fuzionResult.averageTime).toBeLessThan(
    nativeArrayResult.averageTime * 10,
  );
  expect(fuzionResult.averageTime).toBeLessThan(
    nativeForOfResult.averageTime * 15,
  );
  expect(fuzionResult.averageTime).toBeLessThan(
    nativeForResult.averageTime * 20,
  );
});

test('map().filter() chain - 100K iterations', () => {
  const testData = generateTestData(config.arraySize);

  const nativeArrayResult = measurePerformance(
    () => {
      return testData.map(x => x * 2).filter(x => x > 10);
    },
    config.iterations,
    config.warmupRuns,
  );

  const nativeForOfResult = measurePerformance(
    () => {
      const result = [];
      for (const item of testData) {
        const doubled = item * 2;
        if (doubled > 10) {
          result.push(doubled);
        }
      }
      return result;
    },
    config.iterations,
    config.warmupRuns,
  );

  const nativeForResult = measurePerformance(
    () => {
      const result = [];
      for (let i = 0; i < testData.length; i++) {
        const doubled = testData[i] * 2;
        if (doubled > 10) {
          result.push(doubled);
        }
      }
      return result;
    },
    config.iterations,
    config.warmupRuns,
  );

  const fuzionResult = measurePerformance(
    () => {
      return fuzion(
        testData,
        map(x => x * 2),
        filter(x => x > 10),
      );
    },
    config.iterations,
    config.warmupRuns,
  );

  expect(fuzionResult.averageTime).toBeLessThan(
    nativeArrayResult.averageTime * 10,
  );
  expect(fuzionResult.averageTime).toBeLessThan(
    nativeForOfResult.averageTime * 15,
  );
  expect(fuzionResult.averageTime).toBeLessThan(
    nativeForResult.averageTime * 20,
  );
});

test('complex chain with multiple operations - 100K iterations', () => {
  const testData = generateTestData(config.arraySize);

  const nativeArrayResult = measurePerformance(
    () => {
      return testData
        .map(x => x * 2)
        .filter(x => x > 10)
        .map(x => x.toString())
        .filter(x => x.length > 1);
    },
    config.iterations,
    config.warmupRuns,
  );

  const nativeForOfResult = measurePerformance(
    () => {
      const result = [];
      for (const item of testData) {
        const doubled = item * 2;
        if (doubled > 10) {
          const str = doubled.toString();
          if (str.length > 1) {
            result.push(str);
          }
        }
      }
      return result;
    },
    config.iterations,
    config.warmupRuns,
  );

  const nativeForResult = measurePerformance(
    () => {
      const result = [];
      for (let i = 0; i < testData.length; i++) {
        const doubled = testData[i] * 2;
        if (doubled > 10) {
          const str = doubled.toString();
          if (str.length > 1) {
            result.push(str);
          }
        }
      }
      return result;
    },
    config.iterations,
    config.warmupRuns,
  );

  const fuzionResult = measurePerformance(
    () => {
      return fuzion(
        testData,
        map(x => x * 2),
        filter(x => x > 10),
        map(x => x.toString()),
        filter(x => x.length > 1),
      );
    },
    config.iterations,
    config.warmupRuns,
  );

  expect(fuzionResult.averageTime).toBeLessThan(
    nativeArrayResult.averageTime * 10,
  );
  expect(fuzionResult.averageTime).toBeLessThan(
    nativeForOfResult.averageTime * 15,
  );
  expect(fuzionResult.averageTime).toBeLessThan(
    nativeForResult.averageTime * 20,
  );
});

test('object transformation performance - 100K iterations', () => {
  const testData = generateObjectData(config.arraySize);

  const nativeArrayResult = measurePerformance(
    () => {
      return testData
        .filter(item => item.active)
        .map(item => ({ id: item.id, name: item.name.toUpperCase() }));
    },
    config.iterations,
    config.warmupRuns,
  );

  const nativeForOfResult = measurePerformance(
    () => {
      const result = [];
      for (const item of testData) {
        if (item.active) {
          result.push({ id: item.id, name: item.name.toUpperCase() });
        }
      }
      return result;
    },
    config.iterations,
    config.warmupRuns,
  );

  const nativeForResult = measurePerformance(
    () => {
      const result = [];
      for (let i = 0; i < testData.length; i++) {
        const item = testData[i];
        if (item.active) {
          result.push({ id: item.id, name: item.name.toUpperCase() });
        }
      }
      return result;
    },
    config.iterations,
    config.warmupRuns,
  );

  const fuzionResult = measurePerformance(
    () => {
      return fuzion(
        testData,
        filter(item => item.active),
        map(item => ({ id: item.id, name: item.name.toUpperCase() })),
      );
    },
    config.iterations,
    config.warmupRuns,
  );

  expect(fuzionResult.averageTime).toBeLessThan(
    nativeArrayResult.averageTime * 10,
  );
  expect(fuzionResult.averageTime).toBeLessThan(
    nativeForOfResult.averageTime * 15,
  );
  expect(fuzionResult.averageTime).toBeLessThan(
    nativeForResult.averageTime * 20,
  );
});

test('mixed data type performance - 100K iterations', () => {
  const testData = generateMixedData(config.arraySize);

  const nativeArrayResult = measurePerformance(
    () => {
      return testData
        .filter((item): item is number => typeof item === 'number')
        .map(x => x * 2)
        .filter(x => x > 10);
    },
    config.iterations,
    config.warmupRuns,
  );

  const nativeForOfResult = measurePerformance(
    () => {
      const result = [];
      for (const item of testData) {
        if (typeof item === 'number') {
          const doubled = item * 2;
          if (doubled > 10) {
            result.push(doubled);
          }
        }
      }
      return result;
    },
    config.iterations,
    config.warmupRuns,
  );

  const nativeForResult = measurePerformance(
    () => {
      const result = [];
      for (let i = 0; i < testData.length; i++) {
        const item = testData[i];
        if (typeof item === 'number') {
          const doubled = item * 2;
          if (doubled > 10) {
            result.push(doubled);
          }
        }
      }
      return result;
    },
    config.iterations,
    config.warmupRuns,
  );

  const fuzionResult = measurePerformance(
    () => {
      return fuzion(
        testData,
        filter((item): item is number => typeof item === 'number'),
        map(x => x * 2),
        filter(x => x > 10),
      );
    },
    config.iterations,
    config.warmupRuns,
  );

  expect(fuzionResult.averageTime).toBeLessThan(
    nativeArrayResult.averageTime * 10,
  );
  expect(fuzionResult.averageTime).toBeLessThan(
    nativeForOfResult.averageTime * 20,
  );
  expect(fuzionResult.averageTime).toBeLessThan(
    nativeForResult.averageTime * 20,
  );
});

test('scalability test with different array sizes', () => {
  const sizes = [100, 1000, 10000];
  const iterations = 10000;

  sizes.forEach(size => {
    const testData = generateTestData(size);

    const nativeArrayResult = measurePerformance(
      () => {
        return testData.map(x => x * 2).filter(x => x > 10);
      },
      iterations,
      5,
    );

    const fuzionResult = measurePerformance(
      () => {
        return fuzion(
          testData,
          map(x => x * 2),
          filter(x => x > 10),
        );
      },
      iterations,
      5,
    );

    expect(fuzionResult.averageTime).toBeLessThan(
      nativeArrayResult.averageTime * 10,
    );
  });
});

test('memory efficiency comparison', () => {
  const testData = generateTestData(10000);
  const iterations = 1000;

  const nativeArrayResult = measurePerformance(
    () => {
      return testData.map(x => x * 2).filter(x => x > 10);
    },
    iterations,
    5,
  );

  const fuzionResult = measurePerformance(
    () => {
      return fuzion(
        testData,
        map(x => x * 2),
        filter(x => x > 10),
      );
    },
    iterations,
    5,
  );

  expect(fuzionResult.averageTime).toBeLessThan(
    nativeArrayResult.averageTime * 5,
  );
  if (fuzionResult.memoryUsage && nativeArrayResult.memoryUsage) {
    const fuzionMemoryIncrease =
      fuzionResult.memoryUsage.after - fuzionResult.memoryUsage.before;
    const nativeMemoryIncrease =
      nativeArrayResult.memoryUsage.after -
      nativeArrayResult.memoryUsage.before;
    if (fuzionMemoryIncrease > 0 && nativeMemoryIncrease > 0) {
      expect(fuzionMemoryIncrease).toBeLessThanOrEqual(
        nativeMemoryIncrease * 2,
      );
    }
  }
});

test('edge case performance with empty arrays', () => {
  const emptyArray = [0].slice(0, 0);
  const iterations = 100000;

  const nativeArrayResult = measurePerformance(
    () => {
      return emptyArray.map(x => x * 2).filter(x => x > 10);
    },
    iterations,
    10,
  );

  const fuzionResult = measurePerformance(
    () => {
      return fuzion(
        emptyArray,
        map(x => x * 2),
        filter(x => x > 10),
      );
    },
    iterations,
    10,
  );

  expect(fuzionResult.averageTime).toBeLessThan(
    nativeArrayResult.averageTime * 5,
  );
});

test('edge case performance with single element arrays', () => {
  const singleElementArray = [42];
  const iterations = 100000;

  const nativeArrayResult = measurePerformance(
    () => {
      return singleElementArray.map(x => x * 2).filter(x => x > 10);
    },
    iterations,
    10,
  );

  const fuzionResult = measurePerformance(
    () => {
      return fuzion(
        singleElementArray,
        map(x => x * 2),
        filter(x => x > 10),
      );
    },
    iterations,
    10,
  );

  expect(fuzionResult.averageTime).toBeLessThan(
    nativeArrayResult.averageTime * 5,
  );
});
