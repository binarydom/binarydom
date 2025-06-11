import { BinaryDOMRenderer } from '../BinaryDOMRenderer';
export interface TestItem {
    id: number;
    text: string;
}
export declare function generateTestItems(count: number): TestItem[];
export declare function createTestContainer(): HTMLElement;
export declare function cleanupTestContainer(container: HTMLElement): void;
export declare function createTestRenderer(container: HTMLElement): BinaryDOMRenderer;
export declare function measurePerformance(fn: () => void): number;
export declare function simulateScroll(container: HTMLElement, position: number): void;
export declare function getNodeCount(container: HTMLElement): number;
export declare function waitForNextFrame(): Promise<void>;
export declare function waitForTimeout(ms: number): Promise<void>;
export declare function createTestComponent(type: string, props: Record<string, any>, children?: any[]): any;
