"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryDOMBenchmark = void 0;
const BinaryDOMRenderer_1 = require("../BinaryDOMRenderer");
class BinaryDOMBenchmark {
    constructor(container) {
        this.results = new Map();
        this.container = container;
        this.renderer = new BinaryDOMRenderer_1.BinaryDOMRenderer(container);
    }
    async runBenchmark(iterations = 1000) {
        console.log("Starting Binary DOM Benchmark...");
        // Test 1: Initial Render
        await this.measureInitialRender(iterations);
        // Test 2: Update Performance
        await this.measureUpdatePerformance(iterations);
        // Test 3: Memory Usage
        await this.measureMemoryUsage();
        // Test 4: Tree Reconciliation
        await this.measureReconciliation(iterations);
        this.printResults();
    }
    async measureInitialRender(iterations) {
        const times = [];
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            const element = this.createTestElement(100);
            this.renderer.render(element);
            const end = performance.now();
            times.push(end - start);
            this.container.innerHTML = "";
        }
        this.results.set("Initial Render", times);
    }
    async measureUpdatePerformance(iterations) {
        const times = [];
        const element = this.createTestElement(100);
        this.renderer.render(element);
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            const updatedElement = this.createTestElement(100, true);
            this.renderer.render(updatedElement);
            const end = performance.now();
            times.push(end - start);
        }
        this.results.set("Update Performance", times);
    }
    async measureMemoryUsage() {
        const memoryUsage = [];
        const element = this.createTestElement(1000);
        for (let i = 0; i < 5; i++) {
            this.renderer.render(element);
            if (performance.memory) {
                memoryUsage.push(performance.memory.usedJSHeapSize);
            }
        }
        this.results.set("Memory Usage", memoryUsage);
    }
    async measureReconciliation(iterations) {
        const times = [];
        const element = this.createTestElement(100);
        this.renderer.render(element);
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            const newElement = this.createTestElement(100, true);
            this.renderer.render(newElement);
            const end = performance.now();
            times.push(end - start);
        }
        this.results.set("Reconciliation", times);
    }
    createTestElement(depth, randomize = false) {
        const createNode = (level) => ({
            id: Math.random().toString(36).substring(2, 11),
            type: "element",
            tagName: "div",
            props: {
                className: `level-${level}`,
                style: {
                    padding: "10px",
                    margin: "5px",
                    border: "1px solid #ccc",
                },
            },
            attributes: new Map(),
            children: level < depth ? [createNode(level + 1)] : [],
            left: null,
            right: null,
            checksum: 0,
            isDirty: false,
            parent: null,
            eventHandlers: new Map(),
            state: {},
            hooks: [],
        });
        return createNode(0);
    }
    printResults() {
        console.log("\nBinary DOM Benchmark Results:");
        console.log("============================");
        this.results.forEach((times, test) => {
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            const min = Math.min(...times);
            const max = Math.max(...times);
            console.log(`\n${test}:`);
            console.log(`Average: ${avg.toFixed(2)}ms`);
            console.log(`Min: ${min.toFixed(2)}ms`);
            console.log(`Max: ${max.toFixed(2)}ms`);
        });
    }
}
exports.BinaryDOMBenchmark = BinaryDOMBenchmark;
