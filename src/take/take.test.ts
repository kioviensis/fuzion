import { filter } from '../filter/filter';
import { fuzion } from '../fuzion';
import { map } from '../map/map';
import { take } from './take';

test('should take first 3 elements', () => {
  expect(fuzion([1, 2, 3, 4, 5], take(3))).toEqual([1, 2, 3]);
});

test('should take first 2 elements from smaller array', () => {
  expect(fuzion([1, 2], take(5))).toEqual([1, 2]);
});

test('should handle take(0)', () => {
  expect(fuzion([1, 2, 3, 4, 5], take(0))).toEqual([]);
});

test('should handle take with negative number', () => {
  expect(fuzion([1, 2, 3, 4, 5], take(-1))).toEqual([]);
});

test('should handle empty arrays', () => {
  expect(fuzion([], take(3))).toEqual([]);
});

test('should handle single element arrays', () => {
  expect(fuzion([42], take(1))).toEqual([42]);
});

test('should work with chained operations', () => {
  expect(fuzion([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], take(5))).toEqual([
    1, 2, 3, 4, 5,
  ]);
});

test('should handle take with large numbers', () => {
  expect(fuzion([1, 2, 3], take(100))).toEqual([1, 2, 3]);
});

test('should limit output elements, not input elements', () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const result = fuzion(input, filter(x => x % 2 === 0), take(3));
  expect(result).toEqual([2, 4, 6]);
  expect(result.length).toBe(3);
});

test('should handle take with filter', () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const result = fuzion(input, filter(x => x > 3), take(2));
  expect(result).toEqual([4, 5]);
  expect(result.length).toBe(2);
});

test('should handle invalid take counts gracefully', () => {
  const input = [1, 2, 3, 4, 5];

  const result1 = fuzion(input, map(x => x * 2), take(NaN));
  expect(result1).toEqual([2, 4, 6, 8, 10]);

  const result2 = fuzion(input, map(x => x * 2), take(Infinity));
  expect(result2).toEqual([2, 4, 6, 8, 10]);
});
