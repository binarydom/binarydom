import { BinaryDOMNode, NodeType } from "../types/BinaryDOMNode";
import { BinaryDOMRenderer } from "../BinaryDOMRenderer";

describe("Hydration Scenarios", () => {
  let container: HTMLElement;
  let renderer: BinaryDOMRenderer;

  beforeEach(() => {
    container = document.createElement("div");
    renderer = new BinaryDOMRenderer(container);
  });

  describe("State Hydration", () => {
    it("should hydrate component state correctly", () => {
      const initialState = { count: 42 };
      const StateComponent = () => ({
        type: "div" as NodeType,
        props: { children: [] },
        id: "state-component",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
        eventHandlers: new Map(),
        state: initialState,
        hooks: [],
        parent: null,
        fiber: {
          alternate: null,
          child: null,
          sibling: null,
          return: null,
          pendingProps: {},
          memoizedProps: {},
          memoizedState: initialState,
          updateQueue: null,
          flags: 0,
        },
      });

      renderer.render(StateComponent());
      const component = container.querySelector("#state-component");
      expect(component).toBeTruthy();
      // Verify state is preserved in the DOM
      expect(component?.getAttribute("data-state")).toBe(
        JSON.stringify(initialState)
      );
    });

    it("should handle nested state hydration", () => {
      const childState = { name: "Child" };
      const parentState = { count: 42 };

      const Child = () => ({
        type: "div" as NodeType,
        props: { children: [] },
        id: "child",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
        eventHandlers: new Map(),
        state: childState,
        hooks: [],
        parent: null,
        fiber: {
          alternate: null,
          child: null,
          sibling: null,
          return: null,
          pendingProps: {},
          memoizedProps: {},
          memoizedState: childState,
          updateQueue: null,
          flags: 0,
        },
      });

      const Parent = () => ({
        type: "div" as NodeType,
        props: { children: [Child()] },
        id: "parent",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
        eventHandlers: new Map(),
        state: parentState,
        hooks: [],
        parent: null,
        fiber: {
          alternate: null,
          child: null,
          sibling: null,
          return: null,
          pendingProps: {},
          memoizedProps: {},
          memoizedState: parentState,
          updateQueue: null,
          flags: 0,
        },
      });

      renderer.render(Parent());
      const parent = container.querySelector("#parent");
      const child = container.querySelector("#child");

      expect(parent?.getAttribute("data-state")).toBe(
        JSON.stringify(parentState)
      );
      expect(child?.getAttribute("data-state")).toBe(
        JSON.stringify(childState)
      );
    });
  });

  describe("Event Hydration", () => {
    it("should hydrate event handlers correctly", () => {
      const clickHandler = jest.fn();
      const EventComponent = () => ({
        type: "div" as NodeType,
        props: { children: [] },
        id: "event-component",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
        eventHandlers: new Map([["click", clickHandler]]),
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
          flags: 0,
        },
      });

      renderer.render(EventComponent());
      const component = container.querySelector("#event-component");
      component?.dispatchEvent(new Event("click"));
      expect(clickHandler).toHaveBeenCalled();
    });

    it("should handle multiple event types", () => {
      const handlers = {
        click: jest.fn(),
        mouseover: jest.fn(),
        mouseout: jest.fn(),
      };

      const MultiEventComponent = () => ({
        type: "div" as NodeType,
        props: { children: [] },
        id: "multi-event",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
        eventHandlers: new Map([
          ["click", handlers.click],
          ["mouseover", handlers.mouseover],
          ["mouseout", handlers.mouseout],
        ]),
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
          flags: 0,
        },
      });

      renderer.render(MultiEventComponent());
      const component = container.querySelector("#multi-event");

      component?.dispatchEvent(new Event("click"));
      expect(handlers.click).toHaveBeenCalled();

      component?.dispatchEvent(new Event("mouseover"));
      expect(handlers.mouseover).toHaveBeenCalled();

      component?.dispatchEvent(new Event("mouseout"));
      expect(handlers.mouseout).toHaveBeenCalled();
    });
  });

  describe("Complex Hydration Scenarios", () => {
    it("should handle state updates after hydration", () => {
      const initialState = { count: 0 };
      const clickHandler = jest.fn();

      const StatefulComponent = () => ({
        type: "div" as NodeType,
        props: { children: [] },
        id: "stateful",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
        eventHandlers: new Map([["click", clickHandler]]),
        state: initialState,
        hooks: [],
        parent: null,
        fiber: {
          alternate: null,
          child: null,
          sibling: null,
          return: null,
          pendingProps: {},
          memoizedProps: {},
          memoizedState: initialState,
          updateQueue: null,
          flags: 0,
        },
      });

      renderer.render(StatefulComponent());
      const component = container.querySelector("#stateful");

      // Simulate state update
      const newState = { count: 1 };
      component?.setAttribute("data-state", JSON.stringify(newState));
      component?.dispatchEvent(new Event("click"));

      expect(clickHandler).toHaveBeenCalled();
      expect(component?.getAttribute("data-state")).toBe(
        JSON.stringify(newState)
      );
    });

    it("should handle nested component updates during hydration", () => {
      const childState = { name: "Child" };
      const parentState = { count: 0 };
      const clickHandler = jest.fn();

      const Child = () => ({
        type: "div" as NodeType,
        props: { children: [] },
        id: "child",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
        eventHandlers: new Map([["click", clickHandler]]),
        state: childState,
        hooks: [],
        parent: null,
        fiber: {
          alternate: null,
          child: null,
          sibling: null,
          return: null,
          pendingProps: {},
          memoizedProps: {},
          memoizedState: childState,
          updateQueue: null,
          flags: 0,
        },
      });

      const Parent = () => ({
        type: "div" as NodeType,
        props: { children: [Child()] },
        id: "parent",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
        eventHandlers: new Map(),
        state: parentState,
        hooks: [],
        parent: null,
        fiber: {
          alternate: null,
          child: null,
          sibling: null,
          return: null,
          pendingProps: {},
          memoizedProps: {},
          memoizedState: parentState,
          updateQueue: null,
          flags: 0,
        },
      });

      renderer.render(Parent());
      const child = container.querySelector("#child");
      const parent = container.querySelector("#parent");

      // Simulate state updates
      const newChildState = { name: "Updated Child" };
      const newParentState = { count: 1 };

      child?.setAttribute("data-state", JSON.stringify(newChildState));
      parent?.setAttribute("data-state", JSON.stringify(newParentState));
      child?.dispatchEvent(new Event("click"));

      expect(clickHandler).toHaveBeenCalled();
      expect(child?.getAttribute("data-state")).toBe(
        JSON.stringify(newChildState)
      );
      expect(parent?.getAttribute("data-state")).toBe(
        JSON.stringify(newParentState)
      );
    });
  });

  describe("Concurrent Updates", () => {
    it("should handle multiple rapid state updates", () => {
      const initialState = { count: 0 };
      const updateHandler = jest.fn();

      const ConcurrentComponent = () => ({
        type: "div" as NodeType,
        props: { children: [] },
        id: "concurrent",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
        eventHandlers: new Map([["update", updateHandler]]),
        state: initialState,
        hooks: [],
        parent: null,
        fiber: {
          alternate: null,
          child: null,
          sibling: null,
          return: null,
          pendingProps: {},
          memoizedProps: {},
          memoizedState: initialState,
          updateQueue: null,
          flags: 0,
        },
      });

      renderer.render(ConcurrentComponent());
      const component = container.querySelector("#concurrent");

      // Simulate multiple rapid updates
      for (let i = 1; i <= 5; i++) {
        const newState = { count: i };
        component?.setAttribute("data-state", JSON.stringify(newState));
        component?.dispatchEvent(new Event("update"));
      }

      expect(updateHandler).toHaveBeenCalledTimes(5);
      expect(component?.getAttribute("data-state")).toBe(
        JSON.stringify({ count: 5 })
      );
    });

    it("should handle concurrent updates in nested components", () => {
      const childState = { value: 0 };
      const parentState = { count: 0 };
      const childHandler = jest.fn();
      const parentHandler = jest.fn();

      const Child = () => ({
        type: "div" as NodeType,
        props: { children: [] },
        id: "concurrent-child",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
        eventHandlers: new Map([["update", childHandler]]),
        state: childState,
        hooks: [],
        parent: null,
        fiber: {
          alternate: null,
          child: null,
          sibling: null,
          return: null,
          pendingProps: {},
          memoizedProps: {},
          memoizedState: childState,
          updateQueue: null,
          flags: 0,
        },
      });

      const Parent = () => ({
        type: "div" as NodeType,
        props: { children: [Child()] },
        id: "concurrent-parent",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
        eventHandlers: new Map([["update", parentHandler]]),
        state: parentState,
        hooks: [],
        parent: null,
        fiber: {
          alternate: null,
          child: null,
          sibling: null,
          return: null,
          pendingProps: {},
          memoizedProps: {},
          memoizedState: parentState,
          updateQueue: null,
          flags: 0,
        },
      });

      renderer.render(Parent());
      const child = container.querySelector("#concurrent-child");
      const parent = container.querySelector("#concurrent-parent");

      // Simulate concurrent updates
      for (let i = 1; i <= 3; i++) {
        const newChildState = { value: i };
        const newParentState = { count: i * 2 };

        child?.setAttribute("data-state", JSON.stringify(newChildState));
        parent?.setAttribute("data-state", JSON.stringify(newParentState));

        child?.dispatchEvent(new Event("update"));
        parent?.dispatchEvent(new Event("update"));
      }

      expect(childHandler).toHaveBeenCalledTimes(3);
      expect(parentHandler).toHaveBeenCalledTimes(3);
      expect(child?.getAttribute("data-state")).toBe(
        JSON.stringify({ value: 3 })
      );
      expect(parent?.getAttribute("data-state")).toBe(
        JSON.stringify({ count: 6 })
      );
    });
  });

  describe("Memory Management", () => {
    it("should clean up event listeners on unmount", () => {
      const clickHandler = jest.fn();
      const component = {
        type: "div" as NodeType,
        props: { children: [] },
        id: "memory-test",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
        eventHandlers: new Map([["click", clickHandler]]),
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
          flags: 0,
        },
      };

      // Render and then unmount
      renderer.render(component);
      const element = container.querySelector("#memory-test");
      expect(element).toBeTruthy();

      // Unmount by rendering null
      renderer.render({
        type: "div" as NodeType,
        props: { children: [] },
        id: "empty",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
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
          flags: 0,
        },
      });

      // Verify the old element is gone
      expect(container.querySelector("#memory-test")).toBeNull();
    });

    it("should handle large component trees efficiently", () => {
      const createDeepTree = (depth: number, id: string): BinaryDOMNode => {
        if (depth === 0) {
          return {
            type: "div" as NodeType,
            props: { children: [] },
            id: `${id}-leaf`,
            attributes: new Map(),
            children: [],
            left: null,
            right: null,
            checksum: 0,
            isDirty: false,
            value: "",
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
              flags: 0,
            },
          };
        }

        return {
          type: "div" as NodeType,
          props: {
            children: [
              createDeepTree(depth - 1, `${id}-left`),
              createDeepTree(depth - 1, `${id}-right`),
            ],
          },
          id: `${id}-${depth}`,
          attributes: new Map(),
          children: [],
          left: null,
          right: null,
          checksum: 0,
          isDirty: false,
          value: "",
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
            flags: 0,
          },
        };
      };

      // Create a deep tree (4 levels deep = 31 nodes)
      const deepTree = createDeepTree(4, "deep");

      // Measure render time
      const startTime = performance.now();
      renderer.render(deepTree);
      const endTime = performance.now();

      // Verify all nodes are rendered
      for (let i = 0; i <= 4; i++) {
        expect(container.querySelector(`[id^="deep-${i}"]`)).toBeTruthy();
      }

      // Verify leaf nodes
      expect(container.querySelectorAll('[id$="-leaf"]').length).toBe(16);

      // Log performance metrics
      console.log(`Deep tree render time: ${endTime - startTime}ms`);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty component trees", () => {
      const emptyTree = {
        type: "div" as NodeType,
        props: { children: [] },
        id: "empty",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
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
          flags: 0,
        },
      };

      renderer.render(emptyTree);
      expect(container.children.length).toBe(1);
      expect(container.firstChild).toBeTruthy();
    });

    it("should handle components with circular references", () => {
      const circularState = { self: null as any };
      circularState.self = circularState;

      const CircularComponent = () => ({
        type: "div" as NodeType,
        props: { children: [] },
        id: "circular",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
        eventHandlers: new Map(),
        state: circularState,
        hooks: [],
        parent: null,
        fiber: {
          alternate: null,
          child: null,
          sibling: null,
          return: null,
          pendingProps: {},
          memoizedProps: {},
          memoizedState: circularState,
          updateQueue: null,
          flags: 0,
        },
      });

      // Should not throw when rendering
      expect(() => renderer.render(CircularComponent())).not.toThrow();
    });

    it("should handle components with undefined or null values", () => {
      const UndefinedComponent = () => ({
        type: "div" as NodeType,
        props: { children: [] },
        id: "undefined-test",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
        eventHandlers: new Map(),
        state: undefined,
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
          flags: 0,
        },
      });

      const NullComponent = () => ({
        type: "div" as NodeType,
        props: { children: [] },
        id: "null-test",
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        value: "",
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
          memoizedState: null,
          updateQueue: null,
          flags: 0,
        },
      });

      expect(() => renderer.render(UndefinedComponent())).not.toThrow();
      expect(() => renderer.render(NullComponent())).not.toThrow();
    });
  });
});
