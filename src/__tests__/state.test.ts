import { TodoStore } from "../state/TodoStore";

describe("TodoStore", () => {
  it("adds a todo", () => {
    const store = TodoStore.getInstance({
      todos: [],
      filter: "all",
      inputValue: "",
    });
    store.dispatch({ type: "ADD_TODO", payload: "Test" });
    expect(store.getState().todos.length).toBe(1);
  });

  it("toggles a todo", () => {
    const store = TodoStore.getInstance({
      todos: [{ id: "1", text: "Test", completed: false }],
      filter: "all",
      inputValue: "",
    });
    store.dispatch({ type: "TOGGLE_TODO", payload: "1" });
    expect(store.getState().todos[0].completed).toBe(true);
  });
});
