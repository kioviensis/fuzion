<div align="center">

# Fuzion

_Runtime implementation of shortcut fusion for JavaScript and TypeScript_

</div>

Fuzion is an optimization technique that merges multiple array operations into a single loop, eliminating intermediate data structures and providing significant performance improvements over chained native methods.

## 📖 What is Shortcut Fusion?

**Definition** ([haskell docs](https://wiki.haskell.org/Short_cut_fusion)): Shortcut fusion is an optimizer method that merges some function calls into one. E.g., `map f * map g` can be substituted by `map (f * g)`, and `filter p * filter q` can be substituted by `filter (\x -> q x && p x)`. It can also help to remove intermediate data structures. E.g., computing `sum [1..n]` does not require an explicit list structure, and the expression is actually translated into a simple loop.

## 🛠️ API

- **`fuzion(input, ...operators)`** - Main function for shortcut fusion
- **`map(fn)`** - Transform each element
- **`filter(predicate)`** - Include elements that pass the test
- **`forEach(fn)`** - Execute function for each element
- **`take(count)`** - Limit result to first N elements

## 💡 Usage Examples

### Basic Operations

```typescript
import { fuzion, map, filter, take } from 'fuzion';

// Simple transformation
const doubled = fuzion([1, 2, 3, 4, 5], map(x => x * 2));
// Result: [2, 4, 6, 8, 10]

// Filter and transform
const evensDoubled = fuzion([1, 2, 3, 4, 5],
  filter(x => x % 2 === 0),
  map(x => x * 2)
);
// Result: [4, 8]

// Complex chain with early exit
const result = fuzion([1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  map(x => x * 2),           // Double each number
  filter(x => x > 5),         // Keep only > 5
  take(3)                     // Take first 3 results
);
// Result: [6, 8, 10] - stops processing after finding 3 results
```

### TypeScript Support

Fuzion provides full TypeScript inference with up to 13 operator chains:

```typescript
interface User {
  id: number;
  name: string;
  age: number;
}

const users: User[] = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
  { id: 3, name: 'Charlie', age: 35 }
];

// Full type inference
const adultNames = fuzion(users,
  filter(user => user.age >= 30),    // TypeScript knows this is User[]
  map(user => user.name)             // TypeScript infers string[]
);
// Type: string[] = ['Bob', 'Charlie']
```

## ⚡ Performance

- **MAP-only chains**: Competitive with chained native (often faster)
- **TAKE operator**: Up to 58x faster than chained native with early exit
- **Memory efficient**: No intermediate arrays created
- **Optimized constants**: Numeric operator types for faster comparisons
- **Lightweight**: Only 599 B gzipped (tree-shakeable for smaller bundles)

| Operation Type | Performance vs Chained Native | Notes |
|----------------|------------------------------|-------|
| **MAP-only chains** | 1.03x faster | Pre-allocated arrays |
| **TAKE operations** | Up to 58x faster | Early exit optimization |
| **Mixed operations** | 1.18x slower | Function call overhead |
| **Single operations** | 1.18-1.81x slower | Baseline overhead |

### Performance Comparison

**Traditional chaining (creates intermediate arrays):**
```javascript
const result = array
  .map(x => x * 2)      // Creates new array
  .map(x => x + 1)      // Creates another array
  .filter(x => x > 5);  // Creates final array
```

**Fuzion (single loop, no intermediate arrays):**
```javascript
const result = fuzion(array,
  map(x => x * 2),      // Fused into single loop
  map(x => x + 1),      // No intermediate arrays
  filter(x => x > 5)    // Direct processing
);
```

**Real-world example:**
```typescript
const data = Array.from({ length: 10000 }, (_, i) => i + 1);

// Chained native (slower - creates intermediate arrays)
const chained = data
  .map(x => x * 2)
  .map(x => x + 1)
  .filter(x => x > 5)
  .slice(0, 100);

// Fuzion (faster - single loop with early exit)
const fused = fuzion(data,
  map(x => x * 2),
  map(x => x + 1),
  filter(x => x > 5),
  take(100)
);
```

## 🎯 When to Use Fuzion

**✅ Great for:**
- Complex data transformation pipelines
- Operations with `take()` for early exit
- MAP-only chains (often faster than native)
- Memory-constrained environments
- Functional programming patterns

**⚠️ Consider alternatives for:**
- Simple single operations (use native methods)
- Performance-critical single loops (manual implementation)
- Very small arrays (< 100 elements)

## 🔧 Installation

```bash
npm install fuzion
# or
yarn add fuzion
```

## 📄 License

MIT License - see LICENSE file for details.
