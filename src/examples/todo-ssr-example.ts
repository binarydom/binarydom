import { BinaryDOMNode } from "../types/BinaryDOMNode";
import { BinaryDOMServer } from "../ssr/BinaryDOMServer";
import { BinaryDOMRenderer } from "../BinaryDOMRenderer";
import { BinaryDOMHydration } from "../ssr/BinaryDOMHydration";
import { TodoStore, createNodeWithEvents, Filter } from "../state/TodoStore";

// Helper function to create a BinaryDOMNode
function createNode(
  type: string,
  props: any,
  children: BinaryDOMNode[] = []
): BinaryDOMNode {
  return createNodeWithEvents(type, props, children);
}

// Todo Item Component
function createTodoItem(
  todo: { id: string; text: string; completed: boolean },
  store: TodoStore
): BinaryDOMNode {
  return createNode(
    "div",
    {
      className: `todo-item ${todo.completed ? "completed" : ""}`,
      "data-todo-id": todo.id,
    },
    [
      createNode("input", {
        type: "checkbox",
        checked: todo.completed,
        className: "todo-checkbox",
        onChange: () =>
          store.dispatch({ type: "TOGGLE_TODO", payload: todo.id }),
      }),
      createNode("span", {
        className: "todo-text",
        children: [
          {
            id: `todo-text-${todo.id}`,
            type: "text",
            props: { text: todo.text },
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
          },
        ],
      }),
      createNode("button", {
        className: "delete-btn",
        onClick: () =>
          store.dispatch({ type: "DELETE_TODO", payload: todo.id }),
        children: [
          {
            id: `delete-btn-${todo.id}`,
            type: "text",
            props: { text: "×" },
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
          },
        ],
      }),
    ]
  );
}

// Todo List Component
function createTodoList(
  todos: Array<{ id: string; text: string; completed: boolean }>,
  store: TodoStore
): BinaryDOMNode {
  return createNode(
    "div",
    { className: "todo-list" },
    todos.map((todo) => createTodoItem(todo, store))
  );
}

// Todo App Component
function createTodoApp(store: TodoStore): BinaryDOMNode {
  const state = store.getState();
  const filteredTodos = store.getFilteredTodos();

  return createNode("div", { className: "todo-app" }, [
    createNode("h1", { className: "app-title" }, [
      {
        id: "app-title-text",
        type: "text",
        props: { text: "Binary DOM Todo App" },
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
      },
    ]),
    createNode(
      "form",
      {
        className: "todo-form",
        onSubmit: (e: Event) => {
          e.preventDefault();
          store.dispatch({ type: "ADD_TODO", payload: state.inputValue });
        },
      },
      [
        createNode("input", {
          type: "text",
          placeholder: "Add a new todo...",
          className: "todo-input",
          value: state.inputValue,
          onChange: (e: Event) => {
            const target = e.target as HTMLInputElement;
            store.dispatch({ type: "SET_INPUT", payload: target.value });
          },
        }),
        createNode("button", { type: "submit", className: "add-btn" }, [
          {
            id: "add-btn-text",
            type: "text",
            props: { text: "Add" },
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
          },
        ]),
      ]
    ),
    createNode("div", { className: "todo-filters" }, [
      createNode(
        "button",
        {
          className: `filter-btn ${state.filter === "all" ? "active" : ""}`,
          "data-filter": "all",
          onClick: () => store.dispatch({ type: "SET_FILTER", payload: "all" }),
        },
        [
          {
            id: "filter-all-text",
            type: "text",
            props: { text: "All" },
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
          },
        ]
      ),
      createNode(
        "button",
        {
          className: `filter-btn ${state.filter === "active" ? "active" : ""}`,
          "data-filter": "active",
          onClick: () =>
            store.dispatch({ type: "SET_FILTER", payload: "active" }),
        },
        [
          {
            id: "filter-active-text",
            type: "text",
            props: { text: "Active" },
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
          },
        ]
      ),
      createNode(
        "button",
        {
          className: `filter-btn ${
            state.filter === "completed" ? "active" : ""
          }`,
          "data-filter": "completed",
          onClick: () =>
            store.dispatch({ type: "SET_FILTER", payload: "completed" }),
        },
        [
          {
            id: "filter-completed-text",
            type: "text",
            props: { text: "Completed" },
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
          },
        ]
      ),
    ]),
    createTodoList(filteredTodos, store),
  ]);
}

// Initial todos
const initialTodos = [
  { id: "1", text: "Learn Binary DOM", completed: true },
  { id: "2", text: "Build a Todo App", completed: false },
  { id: "3", text: "Implement SSR", completed: false },
];

// Create store
const store = TodoStore.getInstance({
  todos: initialTodos,
  filter: "all",
  inputValue: "",
});

// Create the app
const todoApp = createTodoApp(store);

// Server-side rendering
const server = BinaryDOMServer.getInstance();
const html = server.renderToString(todoApp);

// Example Express server implementation
/*
import express from 'express';
const app = express();

app.get('/', (req, res) => {
  const html = server.renderToString(todoApp);
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Binary DOM Todo App</title>
        <style>
          .todo-app {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .todo-item {
            display: flex;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #eee;
          }
          .todo-item.completed .todo-text {
            text-decoration: line-through;
            color: #888;
          }
          .todo-filters {
            margin: 20px 0;
          }
          .filter-btn {
            margin-right: 10px;
            padding: 5px 10px;
          }
          .filter-btn.active {
            background: #007bff;
            color: white;
          }
          .delete-btn {
            margin-left: auto;
            color: #dc3545;
          }
        </style>
      </head>
      <body>
        <div id="root">${html}</div>
        <script>
          // Initial state for hydration
          window.__INITIAL_STATE__ = ${JSON.stringify(initialTodos)};
        </script>
        <script src="/client.js"></script>
      </body>
    </html>
  `);
});

app.listen(3000);
*/

// Client-side hydration
const container = document.getElementById("root");
if (container) {
  const renderer = new BinaryDOMRenderer(container);
  const hydration = BinaryDOMHydration.getInstance(renderer);
  hydration.hydrate(todoApp, container);

  // Subscribe to store changes
  store.subscribe(() => {
    const newApp = createTodoApp(store);
    hydration.hydrate(newApp, container);
  });
}
