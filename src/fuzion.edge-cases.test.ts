import { fuzion } from './fuzion';
import { map } from './map/map';
import { filter } from './filter/filter';
import { forEach } from './forEach/forEach';
import { take } from './take/take';

describe('fuzion edge cases', () => {
  describe('error handling', () => {
    test('should handle errors in map operations', () => {
      const data = [1, 2, 3, 4, 5];
      
      expect(() => 
        fuzion(
          data,
          map(x => {
            if (x === 3) throw new Error('Test error');
            return x * 2;
          })
        )
      ).toThrow('Test error');
    });

    test('should handle errors in filter operations', () => {
      const data = [1, 2, 3, 4, 5];
      
      expect(() => 
        fuzion(
          data,
          filter(x => {
            if (x === 3) throw new Error('Filter error');
            return x > 2;
          })
        )
      ).toThrow('Filter error');
    });

    test('should handle type coercion in comparisons', () => {
      const mixed = [1, '2', 3, '4', 5];
      
      const result = fuzion(
        mixed,
        filter(x => Number(x) > 2), // Explicit conversion for comparison
        map(x => String(x))
      );
      
      expect(result).toEqual(['3', '4', '5']);
    });
  });

  describe('special values', () => {
    test('should handle NaN values', () => {
      const data = [1, NaN, 3, NaN, 5];
      
      const result = fuzion(
        data,
        filter(x => !isNaN(x)),
        map(x => x * 2)
      );
      
      expect(result).toEqual([2, 6, 10]);
    });

    test('should handle Infinity values', () => {
      const data = [1, Infinity, -Infinity, 4, 5];
      
      const result = fuzion(
        data,
        filter(x => isFinite(x)),
        map(x => x * 2)
      );
      
      expect(result).toEqual([2, 8, 10]);
    });

    test('should handle null and undefined in arrays', () => {
      const data = [1, null, undefined, 4, 5];
      
      const result = fuzion(
        data,
        filter(x => x != null), // Filters both null and undefined
        map(x => x * 2)
      );
      
      expect(result).toEqual([2, 8, 10]);
    });

    test('should handle sparse arrays', () => {
      const sparse = new Array(5);
      sparse[0] = 1;
      sparse[2] = 3;
      sparse[4] = 5;
      
      const result = fuzion(
        sparse,
        filter(x => x !== undefined),
        map(x => x * 2)
      );
      
      expect(result).toEqual([2, 6, 10]);
    });
  });

  describe('large numbers and precision', () => {
    test('should handle very large numbers', () => {
      const data = [
        Number.MAX_SAFE_INTEGER - 1,
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER + 1
      ];
      
      const result = fuzion(
        data,
        map(x => x + 1),
        filter(x => x <= Number.MAX_SAFE_INTEGER)
      );
      
      expect(result).toEqual([Number.MAX_SAFE_INTEGER]);
    });

    test('should handle floating point precision', () => {
      const data = [0.1, 0.2, 0.3];
      
      const result = fuzion(
        data,
        map(x => x + 0.1),
        map(x => Math.round(x * 10) / 10) // Round to avoid precision issues
      );
      
      expect(result).toEqual([0.2, 0.3, 0.4]);
    });
  });

  describe('mutation during iteration', () => {
    test('should not be affected by array mutations during forEach', () => {
      const data = [1, 2, 3, 4, 5];
      const original = [...data];
      
      const result = fuzion(
        data,
        forEach(() => {
          data.push(6); // Try to mutate during iteration
        }),
        map(x => x * 2)
      );
      
      expect(result).toEqual([2, 4, 6, 8, 10]);
      expect(data.length).toBeGreaterThan(original.length); // Mutation happened
    });

    test('should handle object mutations', () => {
      const data = [
        { value: 1 },
        { value: 2 },
        { value: 3 }
      ];
      
      const result = fuzion(
        data,
        map(obj => {
          obj.value *= 2; // Mutate original object
          return obj;
        }),
        filter(obj => obj.value > 2),
        map(obj => obj.value)
      );
      
      expect(result).toEqual([4, 6]);
      expect(data[0].value).toBe(2); // Original was mutated
    });
  });

  describe('complex type combinations', () => {
    test('should handle mixed primitive types', () => {
      const data = [1, 'hello', true, null, undefined, {}, []];
      
      const result = fuzion(
        data,
        filter(x => typeof x === 'string' || typeof x === 'number'),
        map(x => String(x))
      );
      
      expect(result).toEqual(['1', 'hello']);
    });

    test('should handle nested arrays', () => {
      const data = [[1, 2], [3, 4], [5, 6]];
      
      const result = fuzion(
        data,
        map(arr => arr.reduce((a, b) => a + b, 0)),
        filter(sum => sum > 5),
        map(sum => sum * 2)
      );
      
      expect(result).toEqual([14, 22]);
    });

    test('should handle functions as values', () => {
      const data = [
        () => 1,
        () => 2,
        () => 3
      ];
      
      const result = fuzion(
        data,
        map(fn => fn()),
        filter(x => x > 1),
        map(x => x * 2)
      );
      
      expect(result).toEqual([4, 6]);
    });
  });

  describe('take operator edge cases', () => {
    test('should handle take with 0', () => {
      const data = [1, 2, 3, 4, 5];
      
      const result = fuzion(
        data,
        take(0),
        map(x => x * 2)
      );
      
      expect(result).toEqual([]);
    });

    test('should handle take with negative numbers', () => {
      const data = [1, 2, 3, 4, 5];
      
      const result = fuzion(
        data,
        take(-5),
        map(x => x * 2)
      );
      
      expect(result).toEqual([]);
    });

    test('should handle take larger than array', () => {
      const data = [1, 2, 3];
      
      const result = fuzion(
        data,
        take(10),
        map(x => x * 2)
      );
      
      expect(result).toEqual([2, 4, 6]);
    });

    test('should handle multiple take operators', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      
      const result = fuzion(
        data,
        take(8),
        map(x => x * 2),
        take(5),
        filter(x => x > 5)
      );
      
      expect(result).toEqual([6, 8, 10]);
    });
  });

  describe('performance stress tests', () => {
    test('should handle deeply nested operations', () => {
      const data = [1, 2, 3];
      
      let result = data;
      for (let i = 0; i < 10; i++) {
        result = fuzion(
          result,
          map(x => x + 1),
          filter(x => true)
        );
      }
      
      expect(result).toEqual([11, 12, 13]);
    });

    test('should handle very long pipelines', () => {
      const data = [1, 2, 3, 4, 5];
      
      const operators = [];
      for (let i = 0; i < 20; i++) {
        operators.push(map(x => x + 0.1));
        operators.push(filter(() => true));
      }
      
      const result = fuzion(data, ...operators);
      
      expect(result.length).toBe(5);
      expect(result[0]).toBeCloseTo(3, 1); // 1 + 20 * 0.1
    });
  });

  describe('type narrowing and guards', () => {
    test('should properly narrow types with filter', () => {
      const data: (string | number)[] = [1, 'hello', 2, 'world', 3];
      
      const result = fuzion(
        data,
        filter((x): x is number => typeof x === 'number'),
        map(x => x * 2) // x is now known to be number
      );
      
      expect(result).toEqual([2, 4, 6]);
    });

    test('should handle custom type guards', () => {
      interface User {
        name: string;
        age?: number;
      }
      
      const users: User[] = [
        { name: 'Alice', age: 25 },
        { name: 'Bob' },
        { name: 'Charlie', age: 30 }
      ];
      
      const result = fuzion(
        users,
        filter((user): user is User & { age: number } => user.age !== undefined),
        map(user => user.age * 2) // age is now known to exist
      );
      
      expect(result).toEqual([50, 60]);
    });
  });
});