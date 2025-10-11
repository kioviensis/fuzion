import { Kind } from '../common';

export type Take = {
  readonly kind: Kind.TAKE;
  readonly run: () => number;
};

export function take(num: number): Take {
  return {
    kind: Kind.TAKE,
    run: () => num,
  };
}
