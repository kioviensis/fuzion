import { fuzion } from '../fuzion';
import { map } from './map';

describe('[operator] map', () => {
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
        map<number, number>(a => a * 2),
      ),
    ).toEqual([2, 4, 6]);
  });

  test('should stringify multiplied values by 2 with through two map functions', () => {
    expect(
      fuzion(
        [1, 2, 3],
        map<number, number>(a => a * 2),
        map<number, string>(a => String(a)),
      ),
    ).toEqual(['2', '4', '6']);
  });

  test('should map three times with different data types', () => {
    expect(
      fuzion(
        [1, 2, 3],
        map(a => a * 2),
        map(a => String(a)),
        map(a => a + 1),
      ),
    ).toEqual(['21', '41', '61']);
  });
});
