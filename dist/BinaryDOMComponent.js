"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryDOMComponent = void 0;
exports.setCurrentComponent = setCurrentComponent;
exports.useState = useState;
exports.useEffect = useEffect;
exports.createContext = createContext;
// Helper for shallow comparison
function shallowCompare(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (const key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
}
/**
 * Base class for Binary DOM components.
 * Provides state management and lifecycle methods.
 */
class BinaryDOMComponent {
    constructor(props) {
        this.props = props;
        this.state = {}; // State will be initialized in concrete components
        this.refs = {};
    }
    /**
     * Updates the component's state and triggers a re-render.
     * @param partialState The partial state to merge with the current state.
     */
    setState(partialState) {
        this.state = { ...this.state, ...partialState };
        this.forceUpdate();
    }
    /**
     * Forces a re-render of the component.
     */
    forceUpdate() {
        const newElement = this.render();
        // Update the tree (implementation connected to BinaryDOMRenderer)
        this.update(newElement);
    }
    // Lifecycle methods (abstract to enforce implementation where needed)
    componentDidMount() { }
    componentWillUnmount() { }
    componentDidUpdate(prevProps, prevState) { }
    /**
     * Determines if the component should re-render.
     * Uses shallow comparison for props and state.
     * @param nextProps The next props.
     * @param nextState The next state.
     * @returns True if the component should update, false otherwise.
     */
    shouldComponentUpdate(nextProps, nextState) {
        return (!shallowCompare(this.props, nextProps) ||
            !shallowCompare(this.state, nextState));
    }
}
exports.BinaryDOMComponent = BinaryDOMComponent;
// Hooks implementation (simplified - assumes a single component context)
// In a real implementation, context would need to be managed for multiple components
// Placeholder for current component context (needs proper management in the renderer)
let currentComponent = null;
// Function to set the current component context
function setCurrentComponent(component) {
    currentComponent = component;
}
// Helper function to get current component
function getCurrentComponent() {
    if (!currentComponent) {
        throw new Error("Hooks can only be called inside a function component.");
    }
    // We cast here because the specific component type is unknown at this context level
    return currentComponent;
}
/**
 * Hook for managing state within function components.
 * @param initialState The initial state.
 * @returns A tuple containing the current state and a function to update it.
 */
function useState(initialState) {
    const component = getCurrentComponent(); // Use any for component type here
    // Hooks state needs to be managed on the component instance.
    // A real implementation would need a more sophisticated hook management system.
    // For simplicity, we'll simulate hook state on the component instance (this is NOT how React hooks work)
    // A real implementation would use an array of hooks per component fiber
    const hookState = component.state; // WARNING: SIMPLIFICATION - NOT REAL REACT HOOKS
    const setHookState = component.setState.bind(component);
    // In a real implementation, you'd check a hooks array:
    // if (!component.hooks[hookIndex]) { component.hooks[hookIndex] = initialState; }
    // const state = component.hooks[hookIndex];
    // const setState = (newState: T) => { component.hooks[hookIndex] = newState; component.forceUpdate(); };
    // For now, just return the component's state and setState for demonstration
    return [hookState, setHookState];
}
/**
 * Hook for performing side effects in function components.
 * @param callback The effect callback.
 * @param deps The dependency array.
 */
function useEffect(callback, deps) {
    const component = getCurrentComponent(); // Use any for component type here
    // Effect hooks state needs to be managed on the component instance (simplified)
    // A real implementation would use a hooks array per component fiber
    // WARNING: SIMPLIFICATION - NOT REAL REACT HOOKS
    // const hookIndex = component.hooks.length; // Need proper hook index management
    // const prevDeps = component.hooks[hookIndex]?.deps;
    // const hasChangedDeps = !prevDeps || deps.some((dep, i) => dep !== prevDeps[i]);
    // if (hasChangedDeps) {
    //   if (prevDeps && prevDeps.cleanup) { prevDeps.cleanup(); }
    //   component.hooks[hookIndex] = { deps, cleanup: callback() };
    // }
    // For now, simulate a basic effect that runs once (like componentDidMount)
    // A real implementation requires proper hook index and dependency tracking.
    if (!component.__effectRan) {
        component.__effectCleanup = callback();
        component.__effectRan = true;
    }
    // Cleanup on unmount (requires componentWillUnmount logic in renderer)
    // if ((component as any).__effectCleanup && typeof (component as any).__effectCleanup === 'function') {
    //    // Call cleanup when component unmounts
    // }
}
/**
 * Creates a context for providing and consuming values.
 * @param defaultValue The default value for the context.
 * @returns A context object with Provider and Consumer components.
 */
function createContext(defaultValue) {
    // A real context implementation is complex and involves the fiber tree.
    // This is a simplified placeholder.
    const context = {
        _value: defaultValue,
        Provider: (props) => {
            context._value = props.value;
            // In a real implementation, the value would be stored in the fiber context
            return props.children;
        },
        Consumer: (props) => {
            // In a real implementation, consume the value from the fiber context
            return props.children(context._value);
        },
    };
    return context;
}
// Helper function to get current component (simplified - needs proper management)
// This function is for demonstrating hook usage within this simplified context.
// A real implementation would manage the component context during the render phase.
/*
function getCurrentComponent(): BinaryDOMComponent<any, any> {
  // This would be implemented to track the current component during rendering
  // For now, we'll use a global placeholder.
  return (window as any).__currentComponent;
}
*/
