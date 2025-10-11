import { filter } from './filter/filter';
import { forEach } from './forEach/forEach';
import { fuzion } from './fuzion';
import { map } from './map/map';

describe('fuzion', () => {
  test('should return empty array when input is empty and empty handlers', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(fuzion([])).toEqual([]);
  });

  test('should return input array when empty handlers array', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(fuzion([1, 2, 3])).toEqual([1, 2, 3]);
  });

  test('should filter items more than 5 and map them by 2', () => {
    expect(
      fuzion(
        [1, 3, 6, 9],
        filter(a => a > 5),
        map(a => a * 2),
      ),
    ).toEqual([12, 18]);
  });

  test('should filter numbers and map them', () => {
    expect(
      fuzion(
        [1, 3, 6, 's'],
        filter((x): x is number => typeof x === 'number'),
        map(a => a * 2),
      ),
    ).toEqual([2, 6, 12]);
  });

  test('should filter items more than 10 after multiplied by 2', () => {
    expect(
      fuzion(
        [1, 3, 6, 9],
        map(a => a * 2),
        filter(a => a > 10),
      ),
    ).toEqual([12, 18]);
  });

  test('should have number auto typing', () => {
    expect(
      fuzion(
        [2, 4, 6],
        map(a => a.toFixed(1)),
      ),
    ).toEqual(['2.0', '4.0', '6.0']);
  });

  test('should have string auto typing', () => {
    expect(
      fuzion(
        ['2', '4', '6'],
        map(a => a.concat('0')),
      ),
    ).toEqual(['20', '40', '60']);
  });

  test('should have boolean auto typing', () => {
    expect(
      fuzion(
        [true, false, true],
        filter(a => a === true),
      ),
    ).toEqual([true, true]);
  });

  test('should filter, map, and do nothing in foreach', () => {
    expect(
      fuzion(
        [true, false, true],
        filter(a => a === true),
        map(a => !a),
        forEach(() => {}),
      ),
    ).toEqual([false, false]);
  });

  test('should do nothing in foreach, then filter and map values', () => {
    expect(
      fuzion(
        [true, false, true],
        forEach(() => {}),
        filter(a => a === true),
        map(a => !a),
      ),
    ).toEqual([false, false]);
  });

  test('should apply 9 operators', () => {
    expect(
      fuzion(
        [1, 2, 3, 4],
        forEach(() => null), // 1
        forEach(() => undefined), // 2
        forEach(() => 1), // 3
        forEach(() => 's'), // 4
        forEach(() => true), // 5
        forEach(() => {}), // 6
        forEach(() => []), // 7
        forEach(() => Symbol()), // 8
        forEach(() => () => {}), // 9
      ),
    ).toEqual([1, 2, 3, 4]);
  });

  test('should apply 9 operators with proved strict typing', () => {
    expect(
      fuzion(
        [1, 2, 3, 4],
        map(a => a + 1), // 1
        map(a => a.toFixed(0)), // 2
        map(a => a.charCodeAt(0)), // 3
        map(a => a.toFixed(0)), // 4
        map(a => a.charCodeAt(0)), // 5
        map(a => a.toFixed(0)), // 6
        map(a => a.charCodeAt(0)), // 7
        map(a => a.toFixed(0)), // 8
        map(a => a.charCodeAt(0)), // 9
        map(a => a.toFixed(0)), // 8
        map(a => a.charCodeAt(0)), // 9
      ),
    ).toEqual([53, 53, 53, 53]);
  });

  test('should apply 11 operators', () => {
    expect(
      fuzion(
        [1, 2, 3, 4],
        forEach(() => null), // 1
        forEach(() => undefined), // 2
        forEach(() => 1), // 3
        forEach(() => 's'), // 4
        forEach(() => true), // 5
        forEach(() => {}), // 6,,
        forEach(() => []), // 7
        forEach(() => Symbol()), // 8
        forEach(() => () => {}), // 9
        forEach(() => Promise.resolve(5)), // 10
        // eslint-disable-next-line no-new-wrappers
        forEach(() => new String('s')), // 11
      ),
    ).toEqual([1, 2, 3, 4]);
  });

  test('should apply 11 operators and return the num type', () => {
    expect(
      fuzion(
        [1, 2, 3, 4],
        forEach(() => null), // 1
        forEach(() => undefined), // 2
        forEach(() => 1), // 3
        forEach(() => 's'), // 4
        forEach(() => true), // 5
        forEach(() => {}), // 6,,
        forEach(() => []), // 7
        forEach(() => Symbol()), // 8
        forEach(() => () => {}), // 9
        forEach(() => Promise.resolve(5)), // 10
        // eslint-disable-next-line no-new-wrappers
        forEach(() => new String('s')), // 11,
        map(() => 1), // 12
      ),
    ).toEqual([1, 1, 1, 1]);
  });

  test('should apply 11 operators with any typing in the end and throw', () => {
    expect(() =>
      fuzion(
        [1, 2, 3, 4],
        map(a => a + 1), // 1
        map(a => a.toFixed(0)), // 2
        map(a => a.charCodeAt(0)), // 3
        map(a => a.toFixed(0)), // 4
        map(a => a.charCodeAt(0)), // 5
        map(a => a.toFixed(0)), // 6
        map(a => a.charCodeAt(0)), // 7
        map(a => a.toFixed(0)), // 8
        map(a => a.charCodeAt(0)), // 9
        map(a => a.toFixed(0)), // 8
        map(a => a.charCodeAt(0)), // 9
        map(a => a.charCodeAt(0)), // 10 any (number does not have charCodeAt() but typing skips it since the input is "any"
      ),
    ).toThrow(TypeError);
  });
});
