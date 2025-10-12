import { Kind } from './common';
import type { Filter } from './filter/filter';
import { NEGATIVE_SYMBOL } from './filter/filter';
import type { ForEach } from './forEach/forEach';
import type { Map } from './map/map';
import type { Take } from './take/take';

type Operator<TInput, TOutput = TInput> =
  | Map<TInput, TOutput>
  | Filter<TInput, TOutput>
  | ForEach<TInput>
  | Take;

export function fuzion<TInput>(input: TInput[]): TInput[];
export function fuzion<TInput, TOutput>(
  input: TInput[],
  operator: Operator<TInput, TOutput>,
): TOutput[];
export function fuzion<TInput, T1, T2>(
  input: TInput[],
  op1: Filter<TInput, T1>,
  op2: Operator<T1, T2>,
): T2[];
export function fuzion<TInput, T1, T2>(
  input: TInput[],
  op1: Operator<TInput, T1>,
  op2: Operator<T1, T2>,
): T2[];
export function fuzion<TInput, T1, T2, T3>(
  input: TInput[],
  op1: Operator<TInput, T1>,
  op2: Operator<T1, T2>,
  op3: Operator<T2, T3>,
): T3[];
export function fuzion<TInput, T1, T2, T3, T4>(
  input: TInput[],
  op1: Operator<TInput, T1>,
  op2: Operator<T1, T2>,
  op3: Operator<T2, T3>,
  op4: Operator<T3, T4>,
): T4[];
export function fuzion<TInput, T1, T2, T3, T4, T5>(
  input: TInput[],
  op1: Operator<TInput, T1>,
  op2: Operator<T1, T2>,
  op3: Operator<T2, T3>,
  op4: Operator<T3, T4>,
  op5: Operator<T4, T5>,
): T5[];
export function fuzion<TInput, T1, T2, T3, T4, T5, T6>(
  input: TInput[],
  op1: Operator<TInput, T1>,
  op2: Operator<T1, T2>,
  op3: Operator<T2, T3>,
  op4: Operator<T3, T4>,
  op5: Operator<T4, T5>,
  op6: Operator<T5, T6>,
): T6[];
export function fuzion<TInput, T1, T2, T3, T4, T5, T6, T7>(
  input: TInput[],
  op1: Operator<TInput, T1>,
  op2: Operator<T1, T2>,
  op3: Operator<T2, T3>,
  op4: Operator<T3, T4>,
  op5: Operator<T4, T5>,
  op6: Operator<T5, T6>,
  op7: Operator<T6, T7>,
): T7[];
export function fuzion<TInput, T1, T2, T3, T4, T5, T6, T7, T8>(
  input: TInput[],
  op1: Operator<TInput, T1>,
  op2: Operator<T1, T2>,
  op3: Operator<T2, T3>,
  op4: Operator<T3, T4>,
  op5: Operator<T4, T5>,
  op6: Operator<T5, T6>,
  op7: Operator<T6, T7>,
  op8: Operator<T7, T8>,
): T8[];
export function fuzion<TInput, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  input: TInput[],
  op1: Operator<TInput, T1>,
  op2: Operator<T1, T2>,
  op3: Operator<T2, T3>,
  op4: Operator<T3, T4>,
  op5: Operator<T4, T5>,
  op6: Operator<T5, T6>,
  op7: Operator<T6, T7>,
  op8: Operator<T7, T8>,
  op9: Operator<T8, T9>,
): T9[];
export function fuzion<TInput, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  input: TInput[],
  op1: Operator<TInput, T1>,
  op2: Operator<T1, T2>,
  op3: Operator<T2, T3>,
  op4: Operator<T3, T4>,
  op5: Operator<T4, T5>,
  op6: Operator<T5, T6>,
  op7: Operator<T6, T7>,
  op8: Operator<T7, T8>,
  op9: Operator<T8, T9>,
  op10: Operator<T9, T10>,
): T10[];
export function fuzion<TInput>(
  input: TInput[],
  ...operators: Operator<any, any>[]
): any[] {
  if (input.length === 0 || operators.length === 0) {
    return input;
  }

  let length = input.length;
  let takeCount = Infinity;
  const processedOperators = [];

  for (let i = 0; i < operators.length; i += 1) {
    const operator = operators[i];
    if (operator.kind === Kind.TAKE) {
      const count = operator.run();
      if (typeof count === 'number' && count >= 0 && isFinite(count)) {
        takeCount = Math.min(takeCount, count);
      } else if (count <= 0) {
        return [];
      }
    } else {
      processedOperators.push(operator);
    }
  }

  if (takeCount === 0) {
    return [];
  }

  let outputCount = 0;

  const hasFilters = processedOperators.some(op => op.kind === Kind.FILTER);

  if (!hasFilters) {
    // MAP-only chain: use pre-allocated array
      const outputSize = Math.min(length, takeCount)
    const output = new Array(outputSize);
    for (let index = 0; index < outputSize; index += 1) {
      let currentValue = input[index];
      for (let i = 0; i < processedOperators.length; i += 1) {
        currentValue = processedOperators[i].run(currentValue, index);
      }
    output[index] = currentValue;
    }
    return output;
  }

  const output = [];

  for (let index = 0; index < length; index += 1) {
    let currentValue = input[index];
    let shouldSkip = false;

    for (let i = 0; i < processedOperators.length; i += 1) {
      const operator = processedOperators[i];
      const value = operator.run(currentValue, index);

      if (operator.kind === Kind.MAP) {
        currentValue = value;
      } else if (operator.kind === Kind.FOR_EACH) {
        currentValue = value;
      } else if (operator.kind === Kind.FILTER && value === NEGATIVE_SYMBOL) {
        shouldSkip = true;
        break;
      }
    }

    if (!shouldSkip) {
      output.push(currentValue);
      outputCount += 1;
      if (outputCount >= takeCount) break;
    }
  }

  return output;
}
