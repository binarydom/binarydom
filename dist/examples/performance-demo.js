"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BinaryDOMComponent_1 = require("../BinaryDOMComponent");
const BinaryDOMRenderer_1 = require("../BinaryDOMRenderer");
const BinaryDOMBenchmark_1 = require("../benchmark/BinaryDOMBenchmark");
class PerformanceDemo extends BinaryDOMComponent_1.BinaryDOMComponent {
    render() {
        const [items, setItems] = (0, BinaryDOMComponent_1.useState)([]);
        const [searchTerm, setSearchTerm] = (0, BinaryDOMComponent_1.useState)("");
        const [filteredItems, setFilteredItems] = (0, BinaryDOMComponent_1.useState)([]);
        // Simulate data loading
        (0, BinaryDOMComponent_1.useEffect)(() => {
            const loadData = () => {
                const newItems = Array.from({ length: 1000 }, (_, i) => i);
                setItems(newItems);
            };
            loadData();
        }, []);
        // Optimized filtering
        (0, BinaryDOMComponent_1.useEffect)(() => {
            const filterItems = () => {
                const start = performance.now();
                const filtered = items.filter((item) => item.toString().includes(searchTerm));
                const end = performance.now();
                console.log(`Filtering took ${end - start}ms`);
                setFilteredItems(filtered);
            };
            filterItems();
        }, [searchTerm, items]);
        const inputProps = {
            type: "text",
            placeholder: "Search...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
        };
        const inputNode = {
            id: "search-input",
            type: "element",
            tagName: "input",
            props: inputProps,
            attributes: new Map(),
            children: [],
            left: null,
            right: null,
            parent: null,
            checksum: 0,
            isDirty: false,
            eventHandlers: new Map(),
            state: null,
            hooks: [],
        };
        const itemsContainerProps = {
            className: "items-container",
            children: filteredItems.map((item, index) => ({
                id: `item-${item}`,
                type: "element",
                tagName: "div",
                props: {
                    className: "item",
                    key: item,
                },
                attributes: new Map(),
                children: [],
                left: null,
                right: null,
                parent: null,
                checksum: 0,
                isDirty: false,
                eventHandlers: new Map(),
                state: null,
                hooks: [],
            })),
        };
        const itemsContainer = {
            id: "items-container",
            type: "element",
            tagName: "div",
            props: itemsContainerProps,
            attributes: new Map(),
            children: [],
            left: null,
            right: null,
            parent: null,
            checksum: 0,
            isDirty: false,
            eventHandlers: new Map(),
            state: null,
            hooks: [],
        };
        const addButtonProps = {
            onClick: () => {
                const start = performance.now();
                const newItems = [...items, items.length];
                setItems(newItems);
                const end = performance.now();
                console.log(`Update took ${end - start}ms`);
            },
        };
        const addButton = {
            id: "add-button",
            type: "element",
            tagName: "button",
            props: addButtonProps,
            attributes: new Map(),
            children: [
                {
                    id: "add-button-text",
                    type: "text",
                    props: {},
                    attributes: new Map(),
                    children: [],
                    left: null,
                    right: null,
                    parent: null,
                    checksum: 0,
                    isDirty: false,
                    eventHandlers: new Map(),
                    state: null,
                    hooks: [],
                    value: "Add Item",
                },
            ],
            left: null,
            right: null,
            parent: null,
            checksum: 0,
            isDirty: false,
            eventHandlers: new Map(),
            state: null,
            hooks: [],
        };
        return {
            id: "performance-demo",
            type: "element",
            tagName: "div",
            props: {
                className: "performance-demo",
                children: [inputNode, itemsContainer, addButton],
            },
            attributes: new Map(),
            children: [],
            left: null,
            right: null,
            parent: null,
            checksum: 0,
            isDirty: false,
            eventHandlers: new Map(),
            state: null,
            hooks: [],
        };
    }
}
// Usage
const container = document.getElementById("root");
if (container) {
    const renderer = new BinaryDOMRenderer_1.BinaryDOMRenderer(container);
    const demo = new PerformanceDemo({});
    renderer.render(demo.render());
    // Run benchmark after initial render
    setTimeout(() => {
        const benchmark = new BinaryDOMBenchmark_1.BinaryDOMBenchmark(container);
        benchmark.runBenchmark(100);
    }, 1000);
}
