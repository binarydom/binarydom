import { BinaryDOMNode, NodeType } from "../types/BinaryDOMNode";
import { createErrorBoundary } from "../components/ErrorBoundary";
import { BinaryDOMRenderer } from "../BinaryDOMRenderer";

describe("ErrorBoundary", () => {
  let container: HTMLElement;
  let renderer: BinaryDOMRenderer;

  beforeEach(() => {
    container = document.createElement("div");
    renderer = new BinaryDOMRenderer(container);
  });

  it("should render children when no error occurs", () => {
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

    const errorBoundary = createErrorBoundary(
      {
        fallback: (error) => ({
          type: "div" as NodeType,
          props: { children: [] },
          id: "fallback",
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
        }),
      },
      Child()
    );

    renderer.render(errorBoundary);
    expect(container.textContent).toBe("");
  });

  it("should render fallback when error occurs", () => {
    const ErrorComponent = () => {
      throw new Error("Test error");
    };

    const errorBoundary = createErrorBoundary(
      {
        fallback: (error) => ({
          type: "div" as NodeType,
          props: { children: [] },
          id: "fallback",
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
        }),
      },
      ErrorComponent()
    );

    renderer.render(errorBoundary);
    expect(container.textContent).toBe("");
  });

  it("should call onError callback when error occurs", () => {
    const ErrorComponent = () => {
      throw new Error("Test error");
    };

    const onError = jest.fn();
    const errorBoundary = createErrorBoundary(
      {
        fallback: (error) => ({
          type: "div" as NodeType,
          props: { children: [] },
          id: "fallback",
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
        }),
        onError,
      },
      ErrorComponent()
    );

    renderer.render(errorBoundary);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });
});
