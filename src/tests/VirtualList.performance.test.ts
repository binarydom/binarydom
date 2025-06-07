import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BinaryDOMRenderer } from '../BinaryDOMRenderer';
import { VirtualList } from '../../docs/examples/advanced/virtual-list';

describe('VirtualList Performance', () => {
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

  it('renders large dataset efficiently', () => {
    const startTime = performance.now();
    
    const items = Array.from({ length: 100000 }, (_, i) => ({
      id: i,
      text: `Item ${i + 1}`
    }));

    renderer.render(VirtualList({ items, itemHeight: 50 }));
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Initial render should complete within 100ms
    expect(renderTime).toBeLessThan(100);
    
    // Should only render a small subset of items
    const renderedItems = container.querySelectorAll('.virtual-list-item');
    expect(renderedItems.length).toBeLessThanOrEqual(20);
  });

  it('handles rapid scrolling efficiently', () => {
    const items = Array.from({ length: 100000 }, (_, i) => ({
      id: i,
      text: `Item ${i + 1}`
    }));

    renderer.render(VirtualList({ items, itemHeight: 50 }));

    const scrollTimes: number[] = [];
    const scrollPositions = [100, 500, 1000, 2000, 5000];

    // Measure scroll performance
    scrollPositions.forEach(position => {
      const startTime = performance.now();
      container.scrollTop = position;
      container.dispatchEvent(new Event('scroll'));
      const endTime = performance.now();
      scrollTimes.push(endTime - startTime);
    });

    // Each scroll update should complete within 16ms (60fps)
    scrollTimes.forEach(time => {
      expect(time).toBeLessThan(16);
    });
  });

  it('maintains performance during item updates', () => {
    const items = Array.from({ length: 100000 }, (_, i) => ({
      id: i,
      text: `Item ${i + 1}`
    }));

    renderer.render(VirtualList({ items, itemHeight: 50 }));

    const updateTimes: number[] = [];
    const updateCounts = [1000, 5000, 10000, 50000];

    // Measure update performance
    updateCounts.forEach(count => {
      const startTime = performance.now();
      
      const newItems = Array.from({ length: count }, (_, i) => ({
        id: i,
        text: `Updated Item ${i + 1}`
      }));

      renderer.render(VirtualList({ items: newItems, itemHeight: 50 }));
      
      const endTime = performance.now();
      updateTimes.push(endTime - startTime);
    });

    // Updates should complete within 50ms
    updateTimes.forEach(time => {
      expect(time).toBeLessThan(50);
    });
  });

  it('handles memory efficiently', () => {
    const items = Array.from({ length: 100000 }, (_, i) => ({
      id: i,
      text: `Item ${i + 1}`
    }));

    renderer.render(VirtualList({ items, itemHeight: 50 }));

    // Scroll to different positions
    for (let i = 0; i < 100; i++) {
      container.scrollTop = i * 100;
      container.dispatchEvent(new Event('scroll'));
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Measure DOM node count
    const nodeCount = container.querySelectorAll('*').length;
    
    // Should maintain a reasonable number of DOM nodes
    expect(nodeCount).toBeLessThan(100);
  });
}); 