import { BinaryDOMRenderer, BinaryDOMNode } from '../../src/BinaryDOMRenderer';
import { useState, useEffect } from '../../src/hooks';

// Counter component using hooks
function Counter(props: { initialCount: number }): BinaryDOMNode {
  const [count, setCount] = useState(props.initialCount);
  const [isEven, setIsEven] = useState(count % 2 === 0);

  // Update isEven when count changes
  useEffect(() => {
    setIsEven(count % 2 === 0);
  }, [count]);

  return {
    type: 'div',
    props: {
      className: 'counter',
      children: [
        {
          type: 'h2',
          props: {
            children: [`Count: ${count}`]
          },
          id: 'count-display',
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
        },
        {
          type: 'p',
          props: {
            children: [`The number is ${isEven ? 'even' : 'odd'}`]
          },
          id: 'even-odd',
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
        },
        {
          type: 'div',
          props: {
            className: 'button-group',
            children: [
              {
                type: 'button',
                props: {
                  onClick: () => setCount(count - 1)
                },
                id: 'decrement',
                attributes: new Map(),
                children: ['-'],
                left: null,
                right: null,
                checksum: 0,
                isDirty: false,
                value: '',
                eventHandlers: new Map([['click', () => setCount(count - 1)]]),
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
              },
              {
                type: 'button',
                props: {
                  onClick: () => setCount(count + 1)
                },
                id: 'increment',
                attributes: new Map(),
                children: ['+'],
                left: null,
                right: null,
                checksum: 0,
                isDirty: false,
                value: '',
                eventHandlers: new Map([['click', () => setCount(count + 1)]]),
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
            ]
          },
          id: 'buttons',
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
        }
      ]
    },
    id: 'counter',
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
  };
}

// Initialize the renderer
const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const renderer = new BinaryDOMRenderer(container);

// Render the counter with initial count of 0
renderer.render(Counter({ initialCount: 0 }));

/*
This example demonstrates:

1. State Management
   - Using useState hook for count and isEven state
   - State updates trigger re-renders
   - Derived state (isEven) based on count

2. Event Handling
   - Click events on buttons
   - Event delegation for efficiency
   - State updates in event handlers

3. Component Structure
   - Nested component hierarchy
   - Props passing
   - Conditional rendering

4. Performance
   - Efficient updates using binary tree
   - Batched state updates
   - Minimal DOM operations

To run this example:
1. Save as counter.ts
2. Import in your application
3. Add a div with id="root" to your HTML
4. The counter will render with increment/decrement buttons
*/ 