import { filter } from '../filter/filter';
import { fuzion } from '../fuzion';
import { map } from '../map/map';
import { take } from '../take/take';
import {
  generateMixedData,
  generateObjectData,
  generateTestData,
} from './test-utils';

test('should infer complex nested object transformations', () => {
  const users = [
    {
      id: 1,
      profile: {
        name: 'John',
        age: 30,
        preferences: { theme: 'light', notifications: true },
      },
    },
    {
      id: 2,
      profile: {
        name: 'Jane',
        age: 25,
        preferences: { theme: 'dark', notifications: false },
      },
    },
  ];

  const result = fuzion(
    users,
    filter(user => user.profile.age > 25),
    map(user => ({
      id: user.id,
      name: user.profile.name,
      theme: user.profile.preferences.theme,
    })),
  );

  expect(result).toEqual([{ id: 1, name: 'John', theme: 'light' }]);
});

test('should handle generic constraints with T extends', () => {
  interface Identifiable {
    id: number;
  }

  interface Product extends Identifiable {
    name: string;
    price: number;
  }

  const items = [
    { id: 1, name: 'Widget', price: 10 },
    { id: 2, title: 'Consultation', duration: 60 },
  ];

  const result = fuzion(
    items,
    filter((item): item is Product => 'name' in item),
    map(product => ({ id: product.id, name: product.name })),
  );

  expect(result).toEqual([{ id: 1, name: 'Widget' }]);
});

test('should handle union types with proper type narrowing', () => {
  const mixedData = generateMixedData(6);

  const result = fuzion(
    mixedData,
    filter((item): item is number => typeof item === 'number'),
    map(num => num * 2),
    filter(num => num > 4),
  );

  expect(result).toEqual([8]);
});

test('should infer conditional types correctly', () => {
  const responses = [
    { data: 'success', success: true },
    { data: 42, success: true },
    { data: 'error', success: false, error: 'Failed' },
  ];

  const result = fuzion(
    responses,
    filter(response => response.success),
    map(response => response.data),
    filter((data): data is string => typeof data === 'string'),
  );

  expect(result).toEqual(['success']);
});

test('should handle function signature inference', () => {
  type EventHandler<T> = (event: T) => void;

  const handlers = [
    (event: string) => console.log(event),
    async (event: number) => console.log(event),
  ];

  const result = fuzion(
    handlers,
    filter(
      (handler): handler is EventHandler<string> =>
        handler.length === 1 && typeof handler === 'function',
    ),
    map(handler => handler.name || 'anonymous'),
  );

  expect(result.length).toBeGreaterThan(0);
});

test('should narrow types through type guards', () => {
  const data = ['a', 1, true, 'b', 2, false];

  const strings = fuzion(
    data,
    filter((item): item is string => typeof item === 'string'),
    map(str => str.toUpperCase()),
  );

  expect(strings).toEqual(['A', 'B']);

  const numbers = fuzion(
    data,
    filter((item): item is number => typeof item === 'number'),
    map(num => num * 2),
  );

  expect(numbers).toEqual([2, 4]);
});

test('should handle complex type guards with nested properties', () => {
  interface Shape {
    type: 'circle' | 'square' | 'triangle';
    area: number;
  }

  interface Circle extends Shape {
    type: 'circle';
    radius: number;
  }

  interface Square extends Shape {
    type: 'square';
    side: number;
  }

  const shapes = [
    { type: 'circle', area: 78.54 } as Circle,
    { type: 'square', area: 25 } as Square,
    { type: 'triangle', area: 12.5 },
  ];

  const circles = fuzion(
    shapes,
    filter((shape): shape is Circle => shape.type === 'circle'),
    map(circle => ({ area: circle.area })),
  );

  expect(circles).toEqual([{ area: 78.54 }]);
});

test('should transform between different complex types', () => {
  const inputs = [
    { id: 'a', value: 10, metadata: { category: 'test' } },
    { id: 'b', value: 20, metadata: { category: 'prod' } },
  ];

  const result = fuzion(
    inputs,
    filter(input => input.value > 15),
    map(input => ({
      identifier: input.id,
      processed: true,
      score: input.value * 2,
    })),
  );

  expect(result).toEqual([{ identifier: 'b', processed: true, score: 40 }]);
});

test('should handle async-like transformations', () => {
  interface Task {
    id: number;
    status: 'pending' | 'completed' | 'failed';
    result?: unknown;
  }

  const tasks = [
    { id: 1, status: 'pending' },
    { id: 2, status: 'completed', result: 'success' },
    { id: 3, status: 'failed' },
  ];

  const completedTasks = fuzion(
    tasks,
    filter(
      (task): task is Task & { status: 'completed'; result: string } =>
        task.status === 'completed' && task.result !== undefined,
    ),
    map(task => ({ id: task.id, result: task.result })),
  );

  expect(completedTasks).toEqual([{ id: 2, result: 'success' }]);
});

test('should infer types through complex operator chains', () => {
  const users = generateObjectData(5).map((item, index) => ({
    id: item.id,
    name: item.name,
    age: 20 + index * 5,
    email: `user${index + 1}@example.com`,
    active: item.active,
  }));

  const result = fuzion(
    users,
    filter(user => user.active),
    map(user => ({ name: user.name, age: user.age })),
    filter(user => user.age >= 25),
    map(user => `${user.name} (${user.age})`),
    take(2),
  );

  expect(result.length).toBeLessThanOrEqual(2);
});

test('should handle generic operator reuse', () => {
  const isEven = (n: number) => n % 2 === 0;
  const double = (n: number) => n * 2;
  const toString = (n: number) => n.toString();

  const numbers = generateTestData(10);

  const result = fuzion(
    numbers,
    filter(isEven),
    map(double),
    map(toString),
    filter(str => str.length > 1),
  );

  expect(result).toEqual(['12', '16', '20']);
});

test('should handle null/undefined type propagation', () => {
  const data = ['a', null, 'b', undefined, 'c'];

  const result = fuzion(
    data,
    filter((item): item is string => typeof item === 'string'),
    map(str => str.toUpperCase()),
  );

  expect(result).toEqual(['A', 'B', 'C']);
});

test('should handle large datasets with complex types', () => {
  const largeDataset = generateObjectData(1000);

  const result = fuzion(
    largeDataset,
    filter(item => item.active),
    map(item => ({ id: item.id, name: item.name })),
    take(100),
  );

  expect(result.length).toBeLessThanOrEqual(100);
});

test('should handle empty arrays with complex types', () => {
  const emptyArray = [{ id: 0, name: '' }].slice(0, 0);

  const result = fuzion(
    emptyArray,
    filter(item => item.id > 0),
    map(item => item.name.toUpperCase()),
  );

  expect(result).toEqual([]);
});

test('should handle single element arrays', () => {
  const singleItem = [{ id: 1, name: 'Test', active: true }];

  const result = fuzion(
    singleItem,
    filter(item => item.active),
    map(item => item.name),
  );

  expect(result).toEqual(['Test']);
});
