import { Kind } from '../common';

export type Filter<T, R = T> = {
  readonly kind: Kind.FILTER;
  readonly run: (value: T, index: number) => R;
};

export const NEGATIVE_SYMBOL = Symbol.for('NEGATIVE');

export function filter<T, R extends T>(
  predicate: (value: T, index: number) => value is R,
): Filter<T, R>;
export function filter<T>(
  predicate: (value: T, index: number) => boolean,
): Filter<T, T>;
export function filter<T>(
  predicate: (value: T, index: number) => boolean,
): Filter<T, T> {
  return {
    kind: Kind.FILTER,
    run: (value, index) => {
      if (predicate(value, index)) {
        return value;
      } else {
        return NEGATIVE_SYMBOL as T;
      }
    },
  };
}
