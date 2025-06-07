import { BinaryDOMNode } from '../../../src/types/BinaryDOMNode';
import { useState, useEffect, useMemo, useCallback } from '../../../src/hooks';
import { createContext, useContext } from '../../../src/context';

// Types
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

// Create context
const TodoContext = createContext<TodoContextType | null>(null);

// Todo Provider Component
const TodoProvider = ({ children }: { children: BinaryDOMNode[] }): BinaryDOMNode => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = useCallback((text: string) => {
    setTodos(prev => [...prev, { id: Date.now().toString(), text, completed: false }]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const value = useMemo(() => ({
    todos,
    addTodo,
    toggleTodo,
    deleteTodo
  }), [todos, addTodo, toggleTodo, deleteTodo]);

  return {
    type: 'element',
    tagName: 'div',
    id: 'todo-provider',
    props: {
      className: 'todo-provider',
      children: [{
        type: TodoContext.Provider,
        id: 'todo-context-provider',
        props: {
          value,
          children
        },
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        parent: null,
        eventHandlers: new Map(),
        state: null,
        hooks: []
      }]
    },
    attributes: new Map(),
    children: [],
    left: null,
    right: null,
    checksum: 0,
    isDirty: false,
    parent: null,
    eventHandlers: new Map(),
    state: null,
    hooks: []
  };
};

// Todo Input Component
const TodoInput = (): BinaryDOMNode => {
  const [text, setText] = useState('');
  const context = useContext(TodoContext);

  const handleSubmit = useCallback((e: Event) => {
    e.preventDefault();
    if (text.trim()) {
      context?.addTodo(text.trim());
      setText('');
    }
  }, [text, context]);

  return {
    type: 'element',
    tagName: 'form',
    id: 'todo-input',
    props: {
      className: 'todo-input',
      onSubmit: handleSubmit,
      children: [{
        type: 'element',
        tagName: 'input',
        id: 'todo-text-input',
        props: {
          type: 'text',
          value: text,
          onChange: (e: Event) => setText((e.target as HTMLInputElement).value),
          placeholder: 'Add a new todo...'
        },
        attributes: new Map(),
        children: [],
        left: null,
        right: null,
        checksum: 0,
        isDirty: false,
        parent: null,
        eventHandlers: new Map(),
        state: null,
        hooks: []
      }]
    },
    attributes: new Map(),
    children: [],
    left: null,
    right: null,
    checksum: 0,
    isDirty: false,
    parent: null,
    eventHandlers: new Map(),
    state: null,
    hooks: []
  };
};

// Todo List Component
const TodoList = (): BinaryDOMNode => {
  const context = useContext(TodoContext);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return context?.todos.filter(todo => !todo.completed) || [];
      case 'completed':
        return context?.todos.filter(todo => todo.completed) || [];
      default:
        return context?.todos || [];
    }
  }, [context?.todos, filter]);

  return {
    type: 'element',
    tagName: 'div',
    id: 'todo-list',
    props: {
      className: 'todo-list',
      children: [
        {
          type: 'element',
          tagName: 'div',
          id: 'todo-filter',
          props: {
            className: 'todo-filter',
            children: [
              {
                type: 'element',
                tagName: 'button',
                id: 'filter-all',
                props: {
                  onClick: () => setFilter('all'),
                  children: [{ type: 'text', value: 'All', id: 'filter-all', props: {}, attributes: new Map(), children: [], left: null, right: null, checksum: 0, isDirty: false, parent: null, eventHandlers: new Map(), state: null, hooks: [] }]
                },
                attributes: new Map(),
                children: [],
                left: null,
                right: null,
                checksum: 0,
                isDirty: false,
                parent: null,
                eventHandlers: new Map(),
                state: null,
                hooks: []
              },
              {
                type: 'element',
                tagName: 'button',
                id: 'filter-active',
                props: {
                  onClick: () => setFilter('active'),
                  children: [{ type: 'text', value: 'Active', id: 'filter-active', props: {}, attributes: new Map(), children: [], left: null, right: null, checksum: 0, isDirty: false, parent: null, eventHandlers: new Map(), state: null, hooks: [] }]
                },
                attributes: new Map(),
                children: [],
                left: null,
                right: null,
                checksum: 0,
                isDirty: false,
                parent: null,
                eventHandlers: new Map(),
                state: null,
                hooks: []
              },
              {
                type: 'element',
                tagName: 'button',
                id: 'filter-completed',
                props: {
                  onClick: () => setFilter('completed'),
                  children: [{ type: 'text', value: 'Completed', id: 'filter-completed', props: {}, attributes: new Map(), children: [], left: null, right: null, checksum: 0, isDirty: false, parent: null, eventHandlers: new Map(), state: null, hooks: [] }]
                },
                attributes: new Map(),
                children: [],
                left: null,
                right: null,
                checksum: 0,
                isDirty: false,
                parent: null,
                eventHandlers: new Map(),
                state: null,
                hooks: []
              }
            ]
          },
          attributes: new Map(),
          children: [],
          left: null,
          right: null,
          checksum: 0,
          isDirty: false,
          parent: null,
          eventHandlers: new Map(),
          state: null,
          hooks: []
        },
        {
          type: 'element',
          tagName: 'ul',
          id: 'todo-items',
          props: {
            children: filteredTodos.map(todo => ({
              type: 'element',
              tagName: 'li',
              id: `todo-${todo.id}`,
              props: {
                className: `todo-item ${todo.completed ? 'completed' : ''}`,
                children: [
                  {
                    type: 'element',
                    tagName: 'input',
                    id: `todo-checkbox-${todo.id}`,
                    props: {
                      type: 'checkbox',
                      checked: todo.completed,
                      onChange: () => context?.toggleTodo(todo.id)
                    },
                    attributes: new Map(),
                    children: [],
                    left: null,
                    right: null,
                    checksum: 0,
                    isDirty: false,
                    parent: null,
                    eventHandlers: new Map(),
                    state: null,
                    hooks: []
                  },
                  {
                    type: 'element',
                    tagName: 'span',
                    id: `todo-text-${todo.id}`,
                    props: {
                      children: [{ type: 'text', value: todo.text, id: `todo-text-${todo.id}`, props: {}, attributes: new Map(), children: [], left: null, right: null, checksum: 0, isDirty: false, parent: null, eventHandlers: new Map(), state: null, hooks: [] }]
                    },
                    attributes: new Map(),
                    children: [],
                    left: null,
                    right: null,
                    checksum: 0,
                    isDirty: false,
                    parent: null,
                    eventHandlers: new Map(),
                    state: null,
                    hooks: []
                  },
                  {
                    type: 'element',
                    tagName: 'button',
                    id: `todo-delete-${todo.id}`,
                    props: {
                      onClick: () => context?.deleteTodo(todo.id),
                      children: [{ type: 'text', value: 'Delete', id: `todo-delete-${todo.id}`, props: {}, attributes: new Map(), children: [], left: null, right: null, checksum: 0, isDirty: false, parent: null, eventHandlers: new Map(), state: null, hooks: [] }]
                    },
                    attributes: new Map(),
                    children: [],
                    left: null,
                    right: null,
                    checksum: 0,
                    isDirty: false,
                    parent: null,
                    eventHandlers: new Map(),
                    state: null,
                    hooks: []
                  }
                ]
              },
              attributes: new Map(),
              children: [],
              left: null,
              right: null,
              checksum: 0,
              isDirty: false,
              parent: null,
              eventHandlers: new Map(),
              state: null,
              hooks: []
            }))
          },
          attributes: new Map(),
          children: [],
          left: null,
          right: null,
          checksum: 0,
          isDirty: false,
          parent: null,
          eventHandlers: new Map(),
          state: null,
          hooks: []
        }
      ]
    },
    attributes: new Map(),
    children: [],
    left: null,
    right: null,
    checksum: 0,
    isDirty: false,
    parent: null,
    eventHandlers: new Map(),
    state: null,
    hooks: []
  };
};

// Main Todo App Component
export const TodoApp = (): BinaryDOMNode => {
  return {
    type: 'element',
    tagName: 'div',
    id: 'todo-app',
    props: {
      className: 'todo-app',
      children: [
        {
          type: 'element',
          tagName: 'h1',
          id: 'todo-title',
          props: {
            children: [{ type: 'text', value: 'Todo App', id: 'todo-title', props: {}, attributes: new Map(), children: [], left: null, right: null, checksum: 0, isDirty: false, parent: null, eventHandlers: new Map(), state: null, hooks: [] }]
          },
          attributes: new Map(),
          children: [],
          left: null,
          right: null,
          checksum: 0,
          isDirty: false,
          parent: null,
          eventHandlers: new Map(),
          state: null,
          hooks: []
        },
        {
          type: TodoProvider,
          id: 'todo-provider-wrapper',
          props: {
            children: [
              {
                type: TodoInput,
                id: 'todo-input-wrapper',
                props: {},
                attributes: new Map(),
                children: [],
                left: null,
                right: null,
                checksum: 0,
                isDirty: false,
                parent: null,
                eventHandlers: new Map(),
                state: null,
                hooks: []
              },
              {
                type: TodoList,
                id: 'todo-list-wrapper',
                props: {},
                attributes: new Map(),
                children: [],
                left: null,
                right: null,
                checksum: 0,
                isDirty: false,
                parent: null,
                eventHandlers: new Map(),
                state: null,
                hooks: []
              }
            ]
          },
          attributes: new Map(),
          children: [],
          left: null,
          right: null,
          checksum: 0,
          isDirty: false,
          parent: null,
          eventHandlers: new Map(),
          state: null,
          hooks: []
        }
      ]
    },
    attributes: new Map(),
    children: [],
    left: null,
    right: null,
    checksum: 0,
    isDirty: false,
    parent: null,
    eventHandlers: new Map(),
    state: null,
    hooks: []
  };
};

// Initialize the renderer
const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const renderer = new BinaryDOMRenderer(container);

// Render the Todo App
renderer.render(TodoApp());

/*
This example demonstrates:

1. Component Architecture
   - Functional components with hooks
   - Component composition
   - Props and state management
   - Event handling

2. State Management
   - Context API for global state
   - Local state with useState
   - Memoization with useMemo
   - Callback optimization with useCallback

3. Performance Optimizations
   - Memoized context value
   - Memoized filtered todos
   - Optimized event handlers
   - Efficient DOM updates

4. Type Safety
   - TypeScript interfaces
   - Type guards
   - Generic types
   - Type inference

5. Best Practices
   - Separation of concerns
   - Reusable components
   - Clean code structure
   - Error handling

To run this example:
1. Save as todo-app.ts
2. Import in your application
3. Add a div with id="root" to your HTML
4. The Todo App will render with full functionality
*/ 