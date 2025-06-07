# BinaryDOM Documentation

BinaryDOM is a high-performance DOM manipulation library that uses binary tree structures for efficient updates and rendering.

## Table of Contents

1. [Getting Started](./getting-started.md)
2. [Core Concepts](./core-concepts.md)
3. [API Reference](./api-reference.md)
4. [Performance Guide](./performance.md)
5. [Examples](./examples/README.md)
6. [Best Practices](./best-practices.md)

## Quick Start

```typescript
import { BinaryDOMRenderer } from 'binarydom';

// Create a renderer instance
const renderer = new BinaryDOMRenderer(document.getElementById('root'));

// Render a component
renderer.render({
  type: 'div',
  props: {
    children: ['Hello, BinaryDOM!']
  },
  id: 'app',
  attributes: new Map(),
  children: [],
  left: null,
  right: null,
  checksum: 0,
  isDirty: false,
  value: '',
  eventHandlers: new Map(),
  state: null,
  hooks: [],
  parent: null,
  fiber: {
    alternate: null,
    child: null,
    sibling: null,
    return: null,
    pendingProps: {},
    memoizedProps: {},
    memoizedState: undefined,
    updateQueue: null,
    flags: 0
  }
});
```

## Key Features

- 🚀 Binary tree-based DOM representation
- ⚡ Fast diffing using checksums
- 🔄 Batched updates with requestAnimationFrame
- 📦 Small bundle size
- 🛠 TypeScript support
- 🔥 Hot Module Replacement (HMR)
- 🎯 Server-Side Rendering (SSR)
- 🎨 Component-based architecture

## Performance

BinaryDOM is designed for high performance:

- Efficient tree traversal using binary structures
- Optimized diffing algorithm with checksums
- Batched updates to minimize reflows
- Memory-efficient node representation

See the [Performance Guide](./performance.md) for detailed benchmarks and optimization tips.

## Examples

Check out our [Examples](./examples/README.md) section for:

- Basic usage examples
- Component patterns
- State management
- Event handling
- Server-side rendering
- Performance optimizations

## Contributing

We welcome contributions! Please see our [Contributing Guide](./contributing.md) for details.

## License

MIT 