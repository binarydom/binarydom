import { BinaryDOMRenderer } from '../BinaryDOMRenderer';

export interface TestItem {
  id: number;
  text: string;
}

export function generateTestItems(count: number): TestItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    text: `Item ${i + 1}`
  }));
}

export function createTestContainer(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'root';
  document.body.appendChild(container);
  return container;
}

export function cleanupTestContainer(container: HTMLElement): void {
  document.body.removeChild(container);
}

export function createTestRenderer(container: HTMLElement): BinaryDOMRenderer {
  return new BinaryDOMRenderer(container);
}

export function measurePerformance(fn: () => void): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
}

export function simulateScroll(container: HTMLElement, position: number): void {
  container.scrollTop = position;
  container.dispatchEvent(new Event('scroll'));
}

export function getNodeCount(container: HTMLElement): number {
  return container.querySelectorAll('*').length;
}

export function waitForNextFrame(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => resolve());
  });
}

export function waitForTimeout(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createTestComponent(
  type: string,
  props: Record<string, any>,
  children: any[] = []
): any {
  return {
    type,
    props,
    id: `test-${type}`,
    attributes: new Map(),
    children,
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