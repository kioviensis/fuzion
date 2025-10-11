import { fuzion } from '../fuzion';
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
