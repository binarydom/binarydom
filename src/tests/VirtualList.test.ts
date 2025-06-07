import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BinaryDOMRenderer } from '../BinaryDOMRenderer';
import { VirtualList } from '../../docs/examples/advanced/virtual-list';

describe('VirtualList', () => {
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

  it('renders only visible items', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      text: `Item ${i + 1}`
    }));

    renderer.render(VirtualList({ items, itemHeight: 50 }));

    // Container height is 500px, item height is 50px
    // Should render approximately 10 items + buffer
    const renderedItems = container.querySelectorAll('.virtual-list-item');
    expect(renderedItems.length).toBeLessThanOrEqual(20); // 10 visible + 5 buffer on each side
  });

  it('updates visible items on scroll', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      text: `Item ${i + 1}`
    }));

    renderer.render(VirtualList({ items, itemHeight: 50 }));

    // Get initial visible items
    const initialItems = Array.from(container.querySelectorAll('.virtual-list-item'))
      .map(el => el.textContent);

    // Scroll down
    container.scrollTop = 500;
    container.dispatchEvent(new Event('scroll'));

    // Get new visible items
    const newItems = Array.from(container.querySelectorAll('.virtual-list-item'))
      .map(el => el.textContent);

    // Items should be different after scrolling
    expect(newItems).not.toEqual(initialItems);
  });

  it('maintains correct item positions', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      text: `Item ${i + 1}`
    }));

    renderer.render(VirtualList({ items, itemHeight: 50 }));

    const listItems = container.querySelectorAll('.virtual-list-item');
    listItems.forEach((item, index) => {
      const top = parseInt((item as HTMLElement).style.top);
      expect(top).toBe(index * 50); // Each item should be 50px apart
    });
  });

  it('handles empty items array', () => {
    renderer.render(VirtualList({ items: [], itemHeight: 50 }));
    const renderedItems = container.querySelectorAll('.virtual-list-item');
    expect(renderedItems.length).toBe(0);
  });

  it('updates when items change', () => {
    const initialItems = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      text: `Item ${i + 1}`
    }));

    renderer.render(VirtualList({ items: initialItems, itemHeight: 50 }));

    const newItems = Array.from({ length: 500 }, (_, i) => ({
      id: i,
      text: `New Item ${i + 1}`
    }));

    renderer.render(VirtualList({ items: newItems, itemHeight: 50 }));

    const renderedItems = container.querySelectorAll('.virtual-list-item');
    expect(renderedItems.length).toBeLessThanOrEqual(20);
    expect(renderedItems[0].textContent).toBe('New Item 1');
  });
}); 