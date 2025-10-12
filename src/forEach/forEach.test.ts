import { fuzion } from '../fuzion';
import { forEach } from './forEach';

test('should execute side effects for each element', () => {
  const results = [0].slice(0, 0);

  fuzion(
    [1, 2, 3],
    forEach(x => results.push(x * 2)),
  );

  expect(results).toEqual([2, 4, 6]);
});

test('should handle empty arrays', () => {
  const results = [0].slice(0, 0);

  fuzion(
    [],
    forEach(x => results.push(x)),
  );

  expect(results).toEqual([]);
});

test('should handle single element arrays', () => {
  const results = [0].slice(0, 0);

  fuzion(
    [42],
    forEach(x => results.push(x)),
  );

  expect(results).toEqual([42]);
});

test('should work with index parameter', () => {
  const results = [{ value: 0, index: 0 }].slice(0, 0);

  fuzion(
    [10, 20, 30],
    forEach((value, index) => results.push({ value, index })),
  );

  expect(results).toEqual([
    { value: 10, index: 0 },
    { value: 20, index: 1 },
    { value: 30, index: 2 },
  ]);
});

test('should handle complex side effects', () => {
  const processedItems = [{ id: 0, processed: false }].slice(0, 0);

  fuzion(
    [{ id: 1 }, { id: 2 }, { id: 3 }],
    forEach(item => processedItems.push({ id: item.id, processed: true })),
  );

  expect(processedItems).toEqual([
    { id: 1, processed: true },
    { id: 2, processed: true },
    { id: 3, processed: true },
  ]);
});

test('should work with chained operations', () => {
  const results = [0].slice(0, 0);

  fuzion(
    [1, 2, 3, 4, 5],
    forEach(x => results.push(x)),
  );

  expect(results).toEqual([1, 2, 3, 4, 5]);
});

test('should handle side effects with external state', () => {
  let counter = 0;

  fuzion(
    [1, 2, 3, 4, 5],
    forEach(() => counter++),
  );

  expect(counter).toBe(5);
});
