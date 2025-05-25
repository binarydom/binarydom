import { BinaryDOMComponent, useState, useEffect } from "../BinaryDOMComponent";
import { BinaryDOMRenderer } from "../BinaryDOMRenderer";
import { OptimizedTreeTraversal } from "../optimizations/TreeTraversal";
import { BinaryDOMBenchmark } from "../benchmark/BinaryDOMBenchmark";
import { BinaryDOMNode, BinaryDOMProps } from "../types/BinaryDOMNode";

class PerformanceDemo extends BinaryDOMComponent {
  render(): BinaryDOMNode {
    const [items, setItems] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredItems, setFilteredItems] = useState<number[]>([]);

    // Simulate data loading
    useEffect(() => {
      const loadData = () => {
        const newItems = Array.from({ length: 1000 }, (_, i) => i);
        setItems(newItems);
      };
      loadData();
    }, []);

    // Optimized filtering
    useEffect(() => {
      const filterItems = () => {
        const start = performance.now();
        const filtered = items.filter((item) =>
          item.toString().includes(searchTerm)
        );
        const end = performance.now();
        console.log(`Filtering took ${end - start}ms`);
        setFilteredItems(filtered);
      };
      filterItems();
    }, [searchTerm, items]);

    const inputProps: BinaryDOMProps = {
      type: "text",
      placeholder: "Search...",
      value: searchTerm,
      onChange: (e: Event) =>
        setSearchTerm((e.target as HTMLInputElement).value),
    };

    const inputNode: BinaryDOMNode = {
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

    const itemsContainerProps: BinaryDOMProps = {
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

    const itemsContainer: BinaryDOMNode = {
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

    const addButtonProps: BinaryDOMProps = {
      onClick: () => {
        const start = performance.now();
        const newItems = [...items, items.length];
        setItems(newItems);
        const end = performance.now();
        console.log(`Update took ${end - start}ms`);
      },
    };

    const addButton: BinaryDOMNode = {
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
  const renderer = new BinaryDOMRenderer(container);
  const demo = new PerformanceDemo({});
  renderer.render(demo.render());

  // Run benchmark after initial render
  setTimeout(() => {
    const benchmark = new BinaryDOMBenchmark(container);
    benchmark.runBenchmark(100);
  }, 1000);
}
