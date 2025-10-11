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
export function fuzion<
  TInput,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
>(
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
export function fuzion<
  TInput,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
>(
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
export function fuzion<
  TInput,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
>(
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
  op11: Operator<T10, T11>,
): T11[];
export function fuzion<
  TInput,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
>(
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
  op11: Operator<T10, T11>,
  op12: Operator<T11, T12>,
): T12[];
export function fuzion<
  TInput,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  T10,
  T11,
  T12,
  T13,
>(
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
  op11: Operator<T10, T11>,
  op12: Operator<T11, T12>,
  op13: Operator<T12, T13>,
): T13[];
export function fuzion<TInput>(
  input: TInput[],
  ...operators: Operator<any, any>[]
): any[] {
  if (input.length === 0 || operators.length === 0) {
    return input;
  }

  let length = input.length;
  const processedOperators = [];

  // Use indexed loop for better performance
  for (let i = 0; i < operators.length; i += 1) {
    const operator = operators[i];
    if (operator.kind === Kind.TAKE) {
      const takeCount = operator.run();
      if (typeof takeCount === 'number' && takeCount >= 0 && isFinite(takeCount)) {
        length = Math.min(length, takeCount);
      } else {
        length = 0;
      }
    } else {
      processedOperators.push(operator);
    }
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
      } else if (operator.kind === Kind.FILTER && value === NEGATIVE_SYMBOL) {
        shouldSkip = true;
        break;
      }
    }

    if (!shouldSkip) {
      output.push(currentValue);
    }
  }

  return output;
}
