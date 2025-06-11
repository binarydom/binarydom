import { BinaryDOMNode } from "../types/BinaryDOMNode";
export interface Todo {
    id: string;
    text: string;
    completed: boolean;
}
export type Filter = "all" | "active" | "completed";
interface TodoState {
    todos: Todo[];
    filter: Filter;
    inputValue: string;
}
type TodoAction = {
    type: "ADD_TODO";
    payload: string;
} | {
    type: "TOGGLE_TODO";
    payload: string;
} | {
    type: "DELETE_TODO";
    payload: string;
} | {
    type: "SET_FILTER";
    payload: Filter;
} | {
    type: "SET_INPUT";
    payload: string;
};
export declare class TodoStore {
    private static instance;
    private state;
    private listeners;
    private constructor();
    static getInstance(initialState?: TodoState): TodoStore;
    getState(): TodoState;
    subscribe(listener: () => void): () => void;
    private notify;
    dispatch(action: TodoAction): void;
    getFilteredTodos(): Todo[];
}
export declare function createNodeWithEvents(type: string, props: any, children?: BinaryDOMNode[]): BinaryDOMNode;
export {};
