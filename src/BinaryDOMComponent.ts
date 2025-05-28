import { BinaryDOMNode, BinaryDOMProps } from "./types/BinaryDOMNode";

export abstract class BinaryDOMComponent<P = BinaryDOMProps, S = any> {
  protected props: P;
  protected state: S;
  protected refs: { [key: string]: any };

  constructor(props: P) {
    this.props = props;
    this.state = {} as S;
    this.refs = {};
  }

  abstract render(): BinaryDOMNode;

  setState(partialState: any) {
    this.state = { ...this.state, ...partialState };
    this.forceUpdate();
  }

  forceUpdate() {
    // Trigger re-render
    const newElement = this.render();
    // Update the tree
    this.update(newElement);
  }

  protected update(newElement: BinaryDOMNode) {
    // Implementation will be connected to BinaryDOMRenderer
  }

  // Lifecycle methods
  componentDidMount() {}
  componentWillUnmount() {}
  componentDidUpdate(prevProps: P, prevState: S) {}
  shouldComponentUpdate(nextProps: P, nextState: S): boolean {
    return true;
  }
}

// Hooks implementation
export function useState<T>(initialState: T): [T, (newState: T) => void] {
  const component = getCurrentComponent();
  const hookIndex = component.hooks.length;

  if (!component.hooks[hookIndex]) {
    component.hooks[hookIndex] = initialState;
  }

  const setState = (newState: T) => {
    component.hooks[hookIndex] = newState;
    component.forceUpdate();
  };

  return [component.hooks[hookIndex], setState];
}

export function useEffect(callback: () => void | (() => void), deps: any[]) {
  const component = getCurrentComponent();
  const hookIndex = component.hooks.length;

  const prevDeps = component.hooks[hookIndex];
  const hasChangedDeps =
    !prevDeps || deps.some((dep, i) => dep !== prevDeps[i]);

  if (hasChangedDeps) {
    if (prevDeps && prevDeps.cleanup) {
      prevDeps.cleanup();
    }
    component.hooks[hookIndex] = {
      deps,
      cleanup: callback(),
    };
  }
}

// Context implementation
export function createContext<T>(defaultValue: T) {
  const context = {
    _value: defaultValue,
    Provider: (props: { value: T; children: BinaryDOMNode }) => {
      context._value = props.value;
      return props.children;
    },
    Consumer: (props: { children: (value: T) => BinaryDOMNode }) => {
      return props.children(context._value);
    },
  };
  return context;
}

// Helper function to get current component (simplified)
function getCurrentComponent(): any {
  // This would be implemented to track the current component during rendering
  return (window as any).__currentComponent;
}
