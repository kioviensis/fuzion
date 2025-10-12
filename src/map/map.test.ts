import { fuzion } from '../fuzion';
import { map } from './map';

test('should return indices', () => {
  expect(
    fuzion(
      [1, 2, 3],
      map((_, index) => index),
    ),
  ).toEqual([0, 1, 2]);
});

test('should multiply array items by 2', () => {
  expect(
    fuzion(
      [1, 2, 3],
      map(a => a * 2),
    ),
  ).toEqual([2, 4, 6]);
});

test('should stringify multiplied values by 2 with through two map functions', () => {
  expect(
    fuzion(
      [1, 2, 3],
      map(a => a * 2),
      map(a => a.toString()),
    ),
  ).toEqual(['2', '4', '6']);
});

test('should handle empty arrays', () => {
  expect(
    fuzion(
      [],
      map(a => a * 2),
    ),
  ).toEqual([]);
});

test('should handle single element arrays', () => {
  expect(
    fuzion(
      [42],
      map(a => a * 2),
    ),
  ).toEqual([84]);
});

test('should handle complex transformations', () => {
  const data = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
    { id: 3, name: 'Bob' },
  ];

  expect(
    fuzion(
      data,
      map(item => ({ id: item.id, name: item.name.toUpperCase() })),
    ),
  ).toEqual([
    { id: 1, name: 'JOHN' },
    { id: 2, name: 'JANE' },
    { id: 3, name: 'BOB' },
  ]);
});
