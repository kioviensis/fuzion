export function getMemoryUsage(): number {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.memoryUsage) {
      // @ts-ignore
      return process.memoryUsage().heapUsed;
    }
  } catch {}

  return 0;
}

export function generateTestData(size: number): number[] {
  return Array.from({ length: size }, (_, i) => i + 1);
}

export function generateMixedData(size: number): (string | number)[] {
  return Array.from({ length: size }, (_, i) =>
    i % 2 === 0 ? i : `item-${i}`,
  );
}

export function generateObjectData(
  size: number,
): Array<{ id: number; name: string; active: boolean }> {
  return Array.from({ length: size }, (_, i) => ({
    id: i + 1,
    name: `Item: ${i + 1}`,
    active: i % 2 === 0,
  }));
}
