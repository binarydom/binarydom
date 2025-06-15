import { BinaryDOMNode, BinaryDOMProps } from "../../../src/types/BinaryDOMNode";
import { BinaryDOMRenderer } from "../../../src/BinaryDOMRenderer";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export function TodoApp(): BinaryDOMNode {
  const todos: Todo[] = [];
  let filter: 'all' | 'active' | 'completed' = 'all';

  function addTodo(text: string) {
    if (!text.trim()) return;
    todos.push({
      id: Math.random().toString(36).substring(2, 11),
      text: text.trim(),
      completed: false
    });
  }

  function toggleTodo(id: string) {
    const todo = todos.find(t => t.id === id);
    if (todo) todo.completed = !todo.completed;
  }

  function deleteTodo(id: string) {
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) todos.splice(index, 1);
  }

  function setFilter(newFilter: 'all' | 'active' | 'completed') {
    filter = newFilter;
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const createTextNode = (text: string): BinaryDOMNode => ({
    type: 'text',
    id: Math.random().toString(36).substring(2, 11),
    value: text,
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
  });

  return {
    type: 'element',
    tagName: 'div',
    id: 'todo-app',
    props: {
      children: [
        {
          type: 'element',
          tagName: 'h1',
          id: 'title',
          props: {
            children: [createTextNode('Todo App')]
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
          tagName: 'form',
          id: 'todo-form',
          props: {
            children: [
              {
                type: 'element',
                tagName: 'input',
                id: 'todo-input',
                props: {
                  type: 'text',
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
                  children: [createTextNode('All')]
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
                  children: [createTextNode('Active')]
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
                  children: [createTextNode('Completed')]
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
          tagName: 'div',
          id: 'todo-list',
          props: {
            children: filteredTodos.map(todo => ({
              type: 'element',
              tagName: 'div',
              id: `todo-${todo.id}`,
              props: {
                className: `todo-item ${todo.completed ? 'completed' : ''}`,
                children: [
                  {
                    type: 'element',
                    tagName: 'input',
                    id: `checkbox-${todo.id}`,
                    props: {
                      type: 'checkbox',
                      checked: todo.completed
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
                    id: `text-${todo.id}`,
                    props: {
                      children: [createTextNode(todo.text)]
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
                    id: `delete-${todo.id}`,
                    props: {
                      children: [createTextNode('Delete')]
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
} 