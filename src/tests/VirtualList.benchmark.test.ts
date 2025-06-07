import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BinaryDOMRenderer, BinaryDOMNode } from '../BinaryDOMRenderer';
import { VirtualList } from '../../docs/examples/advanced/virtual-list';

// Regular list implementation for comparison
function RegularList(props: { items: { id: number; text: string }[] }): BinaryDOMNode {
  return {
    type: 'div',
    props: {
      className: 'regular-list',
      style: {
        height: '500px',
        overflow: 'auto'
      }
    },
    id: 'regular-list',
    attributes: new Map(),
    children: props.items.map(item => ({
      type: 'div',
      props: {
        className: 'regular-list-item',
        style: {
          height: '50px',
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
  };
}

describe('VirtualList Benchmark', () => {
  let container: HTMLElement;
  let renderer: BinaryDOMRenderer;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
    renderer = new BinaryDOMRenderer(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('outperforms regular list in initial render', () => {
    const items = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      text: `Item ${i + 1}`
    }));

    // Measure virtual list render time
    const virtualStart = performance.now();
    renderer.render(VirtualList({ items, itemHeight: 50 }));
    const virtualEnd = performance.now();
    const virtualTime = virtualEnd - virtualStart;

    // Clear container
    container.innerHTML = '';

    // Measure regular list render time
    const regularStart = performance.now();
    renderer.render(RegularList({ items }));
    const regularEnd = performance.now();
    const regularTime = regularEnd - regularStart;

    // Virtual list should be significantly faster
    expect(virtualTime).toBeLessThan(regularTime * 0.1);
  });

  it('outperforms regular list in scroll performance', () => {
    const items = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      text: `Item ${i + 1}`
    }));

    // Render both lists
    renderer.render(VirtualList({ items, itemHeight: 50 }));
    const virtualContainer = container;
    container.innerHTML = '';
    renderer.render(RegularList({ items }));
    const regularContainer = container;

    // Measure scroll performance
    const scrollPositions = [100, 500, 1000, 2000, 5000];
    const virtualTimes: number[] = [];
    const regularTimes: number[] = [];

    // Test virtual list
    scrollPositions.forEach(position => {
      const start = performance.now();
      virtualContainer.scrollTop = position;
      virtualContainer.dispatchEvent(new Event('scroll'));
      const end = performance.now();
      virtualTimes.push(end - start);
    });

    // Test regular list
    scrollPositions.forEach(position => {
      const start = performance.now();
      regularContainer.scrollTop = position;
      regularContainer.dispatchEvent(new Event('scroll'));
      const end = performance.now();
      regularTimes.push(end - start);
    });

    // Calculate average times
    const virtualAvg = virtualTimes.reduce((a, b) => a + b) / virtualTimes.length;
    const regularAvg = regularTimes.reduce((a, b) => a + b) / regularTimes.length;

    // Virtual list should be significantly faster
    expect(virtualAvg).toBeLessThan(regularAvg * 0.1);
  });

  it('outperforms regular list in memory usage', () => {
    const items = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      text: `Item ${i + 1}`
    }));

    // Render virtual list
    renderer.render(VirtualList({ items, itemHeight: 50 }));
    const virtualNodes = container.querySelectorAll('*').length;

    // Clear container
    container.innerHTML = '';

    // Render regular list
    renderer.render(RegularList({ items }));
    const regularNodes = container.querySelectorAll('*').length;

    // Virtual list should use significantly fewer nodes
    expect(virtualNodes).toBeLessThan(regularNodes * 0.1);
  });

  it('maintains performance advantage during updates', () => {
    const items = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      text: `Item ${i + 1}`
    }));

    // Measure virtual list update time
    renderer.render(VirtualList({ items, itemHeight: 50 }));
    const virtualStart = performance.now();
    renderer.render(VirtualList({ items: items.map(item => ({ ...item, text: `Updated ${item.text}` })), itemHeight: 50 }));
    const virtualEnd = performance.now();
    const virtualTime = virtualEnd - virtualStart;

    // Clear container
    container.innerHTML = '';

    // Measure regular list update time
    renderer.render(RegularList({ items }));
    const regularStart = performance.now();
    renderer.render(RegularList({ items: items.map(item => ({ ...item, text: `Updated ${item.text}` })) }));
    const regularEnd = performance.now();
    const regularTime = regularEnd - regularStart;

    // Virtual list should be significantly faster
    expect(virtualTime).toBeLessThan(regularTime * 0.1);
  });
}); 