import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BinaryDOMRenderer } from '../BinaryDOMRenderer';
import { TodoApp } from '../../docs/examples/advanced/todo-app';
import { createTestContainer, cleanupTestContainer, simulateScroll } from './test-utils';

describe('TodoApp', () => {
  let container: HTMLElement;
  let renderer: BinaryDOMRenderer;

  beforeEach(() => {
    container = createTestContainer();
    renderer = new BinaryDOMRenderer(container);
    renderer.render(TodoApp());
  });

  afterEach(() => {
    cleanupTestContainer(container);
  });

  it('renders initial state correctly', () => {
    const title = container.querySelector('h1');
    expect(title?.textContent).toBe('Todo App');

    const input = container.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
    expect(input?.getAttribute('placeholder')).toBe('Add a new todo...');

    const filterButtons = container.querySelectorAll('.todo-filter button');
    expect(filterButtons.length).toBe(3);
    expect(filterButtons[0].textContent).toBe('All');
    expect(filterButtons[1].textContent).toBe('Active');
    expect(filterButtons[2].textContent).toBe('Completed');
  });

  it('adds new todos', () => {
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    input.value = 'New Todo Item';
    form.dispatchEvent(new Event('submit'));

    const todoItems = container.querySelectorAll('.todo-item');
    expect(todoItems.length).toBe(1);
    expect(todoItems[0].textContent).toContain('New Todo Item');
  });

  it('toggles todo completion', () => {
    // Add a todo
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;
    input.value = 'Toggle Test';
    form.dispatchEvent(new Event('submit'));

    // Toggle completion
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    checkbox.dispatchEvent(new Event('click'));

    // Check if completed class is added
    const todoItem = container.querySelector('.todo-item');
    expect(todoItem?.classList.contains('completed')).toBe(true);
  });

  it('deletes todos', () => {
    // Add a todo
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;
    input.value = 'Delete Test';
    form.dispatchEvent(new Event('submit'));

    // Delete the todo
    const deleteButton = container.querySelector('button:contains("Delete")');
    deleteButton?.dispatchEvent(new Event('click'));

    // Check if todo is removed
    const todoItems = container.querySelectorAll('.todo-item');
    expect(todoItems.length).toBe(0);
  });

  it('filters todos correctly', () => {
    // Add multiple todos
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    // Add first todo
    input.value = 'Todo 1';
    form.dispatchEvent(new Event('submit'));

    // Add second todo
    input.value = 'Todo 2';
    form.dispatchEvent(new Event('submit'));

    // Complete first todo
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes[0].dispatchEvent(new Event('click'));

    // Test All filter
    const allButton = container.querySelector('button:contains("All")');
    allButton?.dispatchEvent(new Event('click'));
    let todoItems = container.querySelectorAll('.todo-item');
    expect(todoItems.length).toBe(2);

    // Test Active filter
    const activeButton = container.querySelector('button:contains("Active")');
    activeButton?.dispatchEvent(new Event('click'));
    todoItems = container.querySelectorAll('.todo-item');
    expect(todoItems.length).toBe(1);
    expect(todoItems[0].textContent).toContain('Todo 2');

    // Test Completed filter
    const completedButton = container.querySelector('button:contains("Completed")');
    completedButton?.dispatchEvent(new Event('click'));
    todoItems = container.querySelectorAll('.todo-item');
    expect(todoItems.length).toBe(1);
    expect(todoItems[0].textContent).toContain('Todo 1');
  });

  it('handles empty todo input', () => {
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    input.value = '   ';
    form.dispatchEvent(new Event('submit'));

    const todoItems = container.querySelectorAll('.todo-item');
    expect(todoItems.length).toBe(0);
  });

  it('maintains state after multiple operations', () => {
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    // Add multiple todos
    for (let i = 1; i <= 3; i++) {
      input.value = `Todo ${i}`;
      form.dispatchEvent(new Event('submit'));
    }

    // Complete some todos
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes[0].dispatchEvent(new Event('click'));
    checkboxes[2].dispatchEvent(new Event('click'));

    // Delete a todo
    const deleteButtons = container.querySelectorAll('button:contains("Delete")');
    deleteButtons[1].dispatchEvent(new Event('click'));

    // Check final state
    const todoItems = container.querySelectorAll('.todo-item');
    expect(todoItems.length).toBe(2);
    expect(todoItems[0].classList.contains('completed')).toBe(true);
    expect(todoItems[1].classList.contains('completed')).toBe(false);
  });
}); 