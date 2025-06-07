import { BinaryDOMRenderer, BinaryDOMNode } from '../../src/BinaryDOMRenderer';
import { useState, useEffect, useMemo } from '../../src/hooks';

interface Item {
  id: number;
  text: string;
}

// Virtual list component with windowing
export function VirtualList(props: { items: Item[]; itemHeight: number }): BinaryDOMNode {
  const [scrollTop, setScrollTop] = useState(0);
  const containerHeight = 500; // Fixed container height
  const visibleItems = Math.ceil(containerHeight / props.itemHeight);
  const bufferItems = 5; // Number of items to render above/below visible area

  // Calculate visible range with buffer
  const startIndex = Math.max(0, Math.floor(scrollTop / props.itemHeight) - bufferItems);
  const endIndex = Math.min(
    props.items.length,
    startIndex + visibleItems + 2 * bufferItems
  );

  // Memoize visible items to prevent unnecessary recalculations
  const visibleItemsList = useMemo(() => {
    return props.items.slice(startIndex, endIndex);
  }, [props.items, startIndex, endIndex]);

  // Handle scroll events
  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    setScrollTop(target.scrollTop);
  };

  return {
    type: 'div',
    props: {
      className: 'virtual-list-container',
      style: {
        height: `${containerHeight}px`,
        overflow: 'auto',
        position: 'relative'
      },
      onScroll: handleScroll
    },
    id: 'virtual-list',
    attributes: new Map(),
    children: [
      {
        type: 'div',
        props: {
          style: {
            height: `${props.items.length * props.itemHeight}px`,
            position: 'relative'
          }
        },
        id: 'virtual-list-content',
        attributes: new Map(),
        children: visibleItemsList.map((item, index) => ({
          type: 'div',
          props: {
            className: 'virtual-list-item',
            style: {
              position: 'absolute',
              top: `${(startIndex + index) * props.itemHeight}px`,
              height: `${props.itemHeight}px`,
              width: '100%',
              padding: '10px',
              boxSizing: 'border-box',
              borderBottom: '1px solid #eee'
            }
          },
          id: `item-${item.id}`,
          attributes: new Map(),
          children: [item.text],
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
        })),
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
      }
    ],
    left: null,
    right: null,
    checksum: 0,
    isDirty: false,
    value: '',
    eventHandlers: new Map([['scroll', handleScroll]]),
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
  };
}

// Generate sample data
const generateItems = (count: number): Item[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    text: `Item ${i + 1}`
  }));
};

// Initialize the renderer
const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const renderer = new BinaryDOMRenderer(container);

// Render the virtual list with 10,000 items
const items = generateItems(10000);
renderer.render(VirtualList({ items, itemHeight: 50 }));

/*
This example demonstrates:

1. Performance Optimizations
   - Windowing technique to render only visible items
   - Buffer items for smooth scrolling
   - Memoization of visible items list
   - Efficient DOM updates using binary tree

2. Memory Management
   - Only rendering visible items reduces memory usage
   - Cleanup of off-screen items
   - Efficient event handling

3. Scroll Performance
   - Smooth scrolling with buffer items
   - Efficient scroll event handling
   - Position calculation optimization

4. Component Structure
   - Nested component hierarchy
   - Absolute positioning for items
   - Dynamic style calculations

To run this example:
1. Save as virtual-list.ts
2. Import in your application
3. Add a div with id="root" to your HTML
4. The virtual list will render with 10,000 items
*/ 