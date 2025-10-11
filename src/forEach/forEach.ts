import { Kind } from '../common';

export type ForEach<T> = {
  readonly kind: Kind.FOR_EACH;
  readonly run: (value: T, index: number) => T;
};

/**
 * rxjs "tap" analogue
 * does not change array values
 */
export function forEach<T>(fn: (value: T, index: number) => void): ForEach<T> {
  return {
    kind: Kind.FOR_EACH,
    run: (value, index) => {
      fn(value, index);
      return value;
    },
  };
}
