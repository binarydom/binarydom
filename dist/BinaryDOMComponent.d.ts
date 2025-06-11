import { BinaryDOMNode, BinaryDOMProps } from "./types/BinaryDOMNode";
/**
 * Base class for Binary DOM components.
 * Provides state management and lifecycle methods.
 */
export declare abstract class BinaryDOMComponent<P = BinaryDOMProps, S = unknown> {
    protected props: P;
    protected state: S;
    protected refs: {
        [key: string]: HTMLElement | Text | null;
    };
    constructor(props: P);
    /**
     * Renders the component to a BinaryDOMNode.
     * Must be implemented by subclasses.
     */
    abstract render(): BinaryDOMNode;
    /**
     * Updates the component's state and triggers a re-render.
     * @param partialState The partial state to merge with the current state.
     */
    setState(partialState: Partial<S>): void;
    /**
     * Forces a re-render of the component.
     */
    forceUpdate(): void;
    /**
     * Abstract method to update the component in the renderer.
     * @param newElement The new BinaryDOMNode representation of the component.
     */
    protected abstract update(newElement: BinaryDOMNode): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: P, prevState: S): void;
    /**
     * Determines if the component should re-render.
     * Uses shallow comparison for props and state.
     * @param nextProps The next props.
     * @param nextState The next state.
     * @returns True if the component should update, false otherwise.
     */
    shouldComponentUpdate(nextProps: P, nextState: S): boolean;
}
export declare function setCurrentComponent(component: BinaryDOMComponent<any, any> | null): void;
/**
 * Hook for managing state within function components.
 * @param initialState The initial state.
 * @returns A tuple containing the current state and a function to update it.
 */
export declare function useState<T>(initialState: T): [T, (newState: T) => void];
/**
 * Hook for performing side effects in function components.
 * @param callback The effect callback.
 * @param deps The dependency array.
 */
export declare function useEffect(callback: () => void | (() => void), deps: any[]): void;
/**
 * Creates a context for providing and consuming values.
 * @param defaultValue The default value for the context.
 * @returns A context object with Provider and Consumer components.
 */
export declare function createContext<T>(defaultValue: T): {
    _value: T;
    Provider: (props: {
        value: T;
        children: BinaryDOMNode;
    }) => BinaryDOMNode;
    Consumer: (props: {
        children: (value: T) => BinaryDOMNode;
    }) => BinaryDOMNode;
};
