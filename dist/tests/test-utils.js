"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTestItems = generateTestItems;
exports.createTestContainer = createTestContainer;
exports.cleanupTestContainer = cleanupTestContainer;
exports.createTestRenderer = createTestRenderer;
exports.measurePerformance = measurePerformance;
exports.simulateScroll = simulateScroll;
exports.getNodeCount = getNodeCount;
exports.waitForNextFrame = waitForNextFrame;
exports.waitForTimeout = waitForTimeout;
exports.createTestComponent = createTestComponent;
const BinaryDOMRenderer_1 = require("../BinaryDOMRenderer");
function generateTestItems(count) {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        text: `Item ${i + 1}`
    }));
}
function createTestContainer() {
    const container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
    return container;
}
function cleanupTestContainer(container) {
    document.body.removeChild(container);
}
function createTestRenderer(container) {
    return new BinaryDOMRenderer_1.BinaryDOMRenderer(container);
}
function measurePerformance(fn) {
    const start = performance.now();
    fn();
    const end = performance.now();
    return end - start;
}
function simulateScroll(container, position) {
    container.scrollTop = position;
    container.dispatchEvent(new Event('scroll'));
}
function getNodeCount(container) {
    return container.querySelectorAll('*').length;
}
function waitForNextFrame() {
    return new Promise(resolve => {
        requestAnimationFrame(() => resolve());
    });
}
function waitForTimeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function createTestComponent(type, props, children = []) {
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
