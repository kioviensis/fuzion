import { Kind } from '../common';

export type MapFn<TValue, TResult> = (value: TValue, index: number) => TResult;
export type Map<TValue, TResult> = {
  readonly kind: typeof Kind.MAP;
  readonly run: MapFn<TValue, TResult>;
};

export function map<TValue, TResult>(
  fn: MapFn<TValue, TResult>,
): Map<TValue, TResult> {
  return {
    kind: Kind.MAP,
    run: fn,
  };
}
