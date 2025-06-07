import {
  BinaryDOMNode,
  BinaryDOMProps,
  NodeType,
} from "../types/BinaryDOMNode";

interface ErrorBoundaryProps extends BinaryDOMProps {
  fallback: (error: Error) => BinaryDOMNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary {
  private props: ErrorBoundaryProps;
  private state: ErrorBoundaryState;
  private static errorBoundaries = new WeakMap<BinaryDOMNode, ErrorBoundary>();

  constructor(props: ErrorBoundaryProps) {
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getErrorBoundary(fiber: BinaryDOMNode): ErrorBoundary | undefined {
    return this.errorBoundaries.get(fiber);
  }

  static registerErrorBoundary(
    fiber: BinaryDOMNode,
    boundary: ErrorBoundary
  ): void {
    this.errorBoundaries.set(fiber, boundary);
  }

  static unregisterErrorBoundary(fiber: BinaryDOMNode): void {
    this.errorBoundaries.delete(fiber);
  }

  static findNearestErrorBoundary(
    fiber: BinaryDOMNode | null
  ): ErrorBoundary | null {
    let currentFiber = fiber;
    while (currentFiber) {
      const boundary = this.getErrorBoundary(currentFiber);
      if (boundary) {
        return boundary;
      }
      currentFiber = currentFiber.fiber?.return || null;
    }
    return null;
  }

  handleError(error: Error, errorInfo: { componentStack: string }): void {
    this.state = {
      hasError: true,
      error,
    };

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): BinaryDOMNode {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }

    // Return children if no error
    const children = this.props.children;
    if (!children) {
      // Return an empty div if no children
      return {
        type: "div" as NodeType,
        props: {},
        id: Math.random().toString(36).substring(7),
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: "",
        isDirty: false,
        value: "",
        key: undefined,
        ref: undefined,
        eventHandlers: new Map(),
        state: null,
        hooks: [],
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

    if (Array.isArray(children)) {
      return children[0] as BinaryDOMNode;
    }
    return children as BinaryDOMNode;
  }

  reset(): void {
    this.state = {
      hasError: false,
      error: null,
    };
  }
}

// Helper function to create an error boundary node
export function createErrorBoundary(
  props: ErrorBoundaryProps,
  children: BinaryDOMNode
): BinaryDOMNode {
  const boundary = new ErrorBoundary(props);
  const node: BinaryDOMNode = {
    type: "div" as NodeType,
    props: {
      ...props,
      children: [children],
    },
    id: Math.random().toString(36).substring(7),
    attributes: new Map(),
    children: [children],
    left: null,
    right: null,
    checksum: "",
    isDirty: false,
    value: "",
    key: props.key,
    ref: props.ref,
    eventHandlers: new Map(),
    state: null,
    hooks: [],
    fiber: {
      alternate: null,
      child: null,
      sibling: null,
      return: null,
      pendingProps: props,
      memoizedProps: {},
      memoizedState: undefined,
      updateQueue: null,
      flags: 0,
    },
  };

  // Register the error boundary
  ErrorBoundary.registerErrorBoundary(node, boundary);
  return node;
}
