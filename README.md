# Binary DOM

A revolutionary DOM implementation based on binary tree structures for optimized web performance.

## Overview

Binary DOM is an innovative approach to DOM manipulation that uses binary tree structures to optimize common DOM operations. It aims to provide better performance than traditional Virtual DOM implementations by:

- Using binary tree structures for efficient traversal and updates
- Implementing checksum-based diffing for faster change detection
- Supporting batched updates for better performance
- Maintaining a compact memory footprint

## Features

- 🚀 Binary tree-based DOM representation
- ⚡ Fast diffing using checksums
- 🔄 Batched updates with requestAnimationFrame
- 📦 Small bundle size
- 🛠 TypeScript support

## Installation

```bash
npm install binary-dom
```

## Quick Start

```typescript
import { BinaryDOM } from "binary-dom";

async function init() {
  const binaryDOM = new BinaryDOM({
    useChecksums: true,
    batchUpdates: true,
    maxBatchSize: 100,
  });

  await binaryDOM.initialize();

  // Mount your DOM element
  const element = document.getElementById("app");
  binaryDOM.mount(element);
}
```

## How It Works

1. **Binary Tree Structure**: The DOM is converted into a binary tree where:

   - Left child points to the first child of a node
   - Right child points to the next sibling
   - Original children array is preserved for reconstruction

2. **Efficient Diffing**: Changes are detected using:

   - Checksum comparison for quick subtree equality check
   - Attribute comparison for detailed changes
   - Binary tree traversal for efficient updates

3. **Batched Updates**: Changes are applied in batches using requestAnimationFrame for optimal performance

## Performance

Binary DOM aims to provide better performance than traditional Virtual DOM implementations:

- Faster diffing through checksum-based comparison
- Reduced memory usage with binary tree structure
- Optimized updates through batching

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Bundle Size Tracking

This project uses [Size Limit](https://github.com/ai/size-limit) to track bundle size changes. The current size limit is set to 50 kB.

### Available Commands

- `npm run size` - Check current bundle size
- `npm run size:track` - Track bundle size changes

### Bundle Size Reports

Bundle size reports are automatically generated on:

- Pull requests to main/master branches
- Pushes to main/master branches

The reports are available in the GitHub Actions workflow runs and as comments on pull requests.

### Size Limits

- Main bundle: 50 kB
- Individual chunks: 25 kB

These limits are enforced in CI to prevent accidental size increases.
