import { BinaryDOMRenderer } from "../BinaryDOMRenderer";
import { BinaryDOMNode } from "../types/BinaryDOMNode";

describe("BinaryDOMRenderer", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("renders a simple element", () => {
    const node: BinaryDOMNode = {
      id: "1",
      type: "element",
      tagName: "div",
      props: { className: "test", children: [] },
      attributes: new Map(),
      children: [],
      left: null,
      right: null,
      checksum: 0,
      isDirty: false,
      parent: null,
      eventHandlers: new Map(),
      state: null,
      hooks: [],
    };
    const renderer = new BinaryDOMRenderer(container);
    renderer.render(node);
    expect(container.querySelector(".test")).not.toBeNull();
  });

  it("updates an element", () => {
    const node1: BinaryDOMNode = {
      id: "1",
      type: "element",
      tagName: "div",
      props: { className: "test1", children: [] },
      attributes: new Map(),
      children: [],
      left: null,
      right: null,
      checksum: 0,
      isDirty: false,
      parent: null,
      eventHandlers: new Map(),
      state: null,
      hooks: [],
    };
    const node2: BinaryDOMNode = {
      ...node1,
      props: { className: "test2", children: [] },
    };
    const renderer = new BinaryDOMRenderer(container);
    renderer.render(node1);
    renderer.render(node2);
    expect(container.querySelector(".test2")).not.toBeNull();
  });

  // Add more tests for deletions, function components, etc.
});
