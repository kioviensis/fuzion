import { fuzion } from '../fuzion';
import { filter } from './filter';

test('should filter even numbers', () => {
  expect(
    fuzion(
      [1, 2, 3, 4, 5, 6],
      filter(x => x % 2 === 0),
    ),
  ).toEqual([2, 4, 6]);
});

test('should filter numbers greater than 3', () => {
  expect(
    fuzion(
      [1, 2, 3, 4, 5],
      filter(x => x > 3),
    ),
  ).toEqual([4, 5]);
});

test('should filter strings by length', () => {
  expect(
    fuzion(
      ['a', 'ab', 'abc', 'abcd'],
      filter(str => str.length > 2),
    ),
  ).toEqual(['abc', 'abcd']);
});

test('should handle empty arrays', () => {
  expect(
    fuzion(
      [],
      filter(x => x > 0),
    ),
  ).toEqual([]);
});

test('should handle single element arrays', () => {
  expect(
    fuzion(
      [42],
      filter(x => x > 40),
    ),
  ).toEqual([42]);
});

test('should handle complex filter conditions', () => {
  const data = [
    { id: 1, name: 'John', age: 25 },
    { id: 2, name: 'Jane', age: 30 },
    { id: 3, name: 'Bob', age: 35 },
  ];

  expect(
    fuzion(
      data,
      filter(person => person.age > 25 && person.name.length > 3),
    ),
  ).toEqual([{ id: 2, name: 'Jane', age: 30 }]);
});

test('should filter with index parameter', () => {
  expect(
    fuzion(
      [10, 20, 30, 40, 50],
      filter((_, index) => index % 2 === 0),
    ),
  ).toEqual([10, 30, 50]);
});

test('should filter even indices', () => {
  expect(
    fuzion(
      ['q', 'w', 'e', 'r', 't', 'y'],
      filter((_, i) => i % 2 === 0),
    ),
  ).toEqual(['q', 'e', 't']);
});

test('should filter with Boolean', () => {
  expect(fuzion([true, false, true], filter(Boolean))).toEqual([true, true]);
});

test('should filter even index', () => {
  expect(fuzion([true, false, true], filter(Boolean))).toEqual([true, true]);
});
