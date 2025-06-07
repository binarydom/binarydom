# Core Concepts

## Binary Tree Structure

BinaryDOM uses a binary tree structure to represent the DOM, where:

- Left child points to the first child of a node
- Right child points to the next sibling
- Original children array is preserved for reconstruction

This structure enables efficient traversal and updates.

```typescript
interface BinaryDOMNode {
  type: NodeType;
  props: BinaryDOMProps;
  id: string;
  attributes: Map<string, string>;
  children: BinaryDOMNode[];
  left: BinaryDOMNode | null;  // First child
  right: BinaryDOMNode | null; // Next sibling
  checksum: number;
  isDirty: boolean;
  // ... other properties
}
```

## Reconciliation Process

1. **Tree Traversal**
   - Uses binary tree structure for efficient traversal
   - Caches traversal results for performance
   - Supports both depth-first and breadth-first traversal

2. **Diffing Algorithm**
   - Uses checksums for quick subtree equality check
   - Compares attributes and properties for detailed changes
   - Batches updates for optimal performance

3. **Update Process**
   - Applies changes in batches using requestAnimationFrame
   - Minimizes DOM operations
   - Maintains consistency with the virtual tree

## Component System

### Function Components

```typescript
function Counter(props: { initialCount: number }): BinaryDOMNode {
  const [count, setCount] = useState(props.initialCount);
  
  return {
    type: 'div',
    props: {
      children: [
        {
          type: 'button',
          props: {
            onClick: () => setCount(count + 1)
          },
          children: [`Count: ${count}`]
        }
      ]
    }
    // ... other required properties
  };
}
```

### Class Components

```typescript
class Counter extends BinaryDOMComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { count: 0 };
  }

  render(): BinaryDOMNode {
    return {
      type: 'div',
      props: {
        children: [
          {
            type: 'button',
            props: {
              onClick: () => this.setState({ count: this.state.count + 1 })
            },
            children: [`Count: ${this.state.count}`]
          }
        ]
      }
      // ... other required properties
    };
  }
}
```

## State Management

### Hooks

```typescript
function useCounter(initialCount: number) {
  const [count, setCount] = useState(initialCount);
  const [isEven, setIsEven] = useState(count % 2 === 0);

  useEffect(() => {
    setIsEven(count % 2 === 0);
  }, [count]);

  return { count, setCount, isEven };
}
```

### Context

```typescript
const ThemeContext = createContext('light');

function ThemeProvider(props: { children: BinaryDOMNode }) {
  const [theme, setTheme] = useState('light');
  
  return {
    type: 'div',
    props: {
      children: [
        {
          type: ThemeContext.Provider,
          props: { value: theme },
          children: [props.children]
        }
      ]
    }
    // ... other required properties
  };
}
```

## Event System

BinaryDOM uses a delegated event system for efficient event handling:

```typescript
function Button(props: { onClick: () => void }): BinaryDOMNode {
  return {
    type: 'button',
    props: {
      onClick: props.onClick
    },
    eventHandlers: new Map([
      ['click', props.onClick]
    ])
    // ... other required properties
  };
}
```

## Server-Side Rendering

BinaryDOM supports server-side rendering with hydration:

```typescript
// Server
const html = renderToString(App());

// Client
hydrate(App(), document.getElementById('root'));
```

## Performance Optimizations

1. **Tree Traversal**
   - Cached traversal results
   - Efficient binary tree structure
   - Optimized node lookup

2. **Update Batching**
   - Batches multiple updates
   - Uses requestAnimationFrame
   - Minimizes reflows

3. **Memory Management**
   - Efficient node representation
   - Garbage collection friendly
   - Minimal memory footprint

See the [Performance Guide](./performance.md) for detailed optimization strategies. 