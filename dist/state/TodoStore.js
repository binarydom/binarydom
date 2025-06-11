"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoStore = void 0;
exports.createNodeWithEvents = createNodeWithEvents;
class TodoStore {
    constructor(initialState) {
        this.listeners = new Set();
        this.state = initialState;
    }
    static getInstance(initialState) {
        if (!this.instance) {
            this.instance = new TodoStore(initialState || {
                todos: [],
                filter: "all",
                inputValue: "",
            });
        }
        return this.instance;
    }
    getState() {
        return this.state;
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    notify() {
        this.listeners.forEach((listener) => listener());
    }
    dispatch(action) {
        switch (action.type) {
            case "ADD_TODO":
                if (action.payload.trim()) {
                    this.state = {
                        ...this.state,
                        todos: [
                            ...this.state.todos,
                            {
                                id: Math.random().toString(36).substring(2, 11),
                                text: action.payload,
                                completed: false,
                            },
                        ],
                        inputValue: "",
                    };
                }
                break;
            case "TOGGLE_TODO":
                this.state = {
                    ...this.state,
                    todos: this.state.todos.map((todo) => todo.id === action.payload
                        ? { ...todo, completed: !todo.completed }
                        : todo),
                };
                break;
            case "DELETE_TODO":
                this.state = {
                    ...this.state,
                    todos: this.state.todos.filter((todo) => todo.id !== action.payload),
                };
                break;
            case "SET_FILTER":
                this.state = {
                    ...this.state,
                    filter: action.payload,
                };
                break;
            case "SET_INPUT":
                this.state = {
                    ...this.state,
                    inputValue: action.payload,
                };
                break;
        }
        this.notify();
    }
    getFilteredTodos() {
        switch (this.state.filter) {
            case "active":
                return this.state.todos.filter((todo) => !todo.completed);
            case "completed":
                return this.state.todos.filter((todo) => todo.completed);
            default:
                return this.state.todos;
        }
    }
}
exports.TodoStore = TodoStore;
// Helper function to create a BinaryDOMNode with event handlers
function createNodeWithEvents(type, props, children = []) {
    const node = {
        id: Math.random().toString(36).substring(2, 11),
        type: "element",
        tagName: type,
        props,
        attributes: new Map(),
        children,
        left: null,
        right: null,
        parent: null,
        checksum: 0,
        isDirty: false,
        eventHandlers: new Map(),
        state: null,
        hooks: [],
    };
    // Add event handlers if specified in props
    if (props.onClick) {
        node.eventHandlers.set("click", props.onClick);
    }
    if (props.onChange) {
        node.eventHandlers.set("change", props.onChange);
    }
    if (props.onSubmit) {
        node.eventHandlers.set("submit", props.onSubmit);
    }
    return node;
}
// Example usage in todo-ssr-example.ts:
/*
const store = TodoStore.getInstance({
  todos: initialTodos,
  filter: 'all',
  inputValue: ''
});

// Subscribe to store changes
store.subscribe(() => {
  const state = store.getState();
  const filteredTodos = store.getFilteredTodos();
  const newApp = createTodoApp(filteredTodos);
  hydration.hydrate(newApp, container);
});

// Event handlers
const handleAddTodo = (e: Event) => {
  e.preventDefault();
  store.dispatch({ type: 'ADD_TODO', payload: store.getState().inputValue });
};

const handleToggleTodo = (id: string) => {
  store.dispatch({ type: 'TOGGLE_TODO', payload: id });
};

const handleDeleteTodo = (id: string) => {
  store.dispatch({ type: 'DELETE_TODO', payload: id });
};

const handleFilterChange = (filter: Filter) => {
  store.dispatch({ type: 'SET_FILTER', payload: filter });
};

const handleInputChange = (value: string) => {
  store.dispatch({ type: 'SET_INPUT', payload: value });
};
*/
