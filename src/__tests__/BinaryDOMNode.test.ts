import { BinaryDOMNode } from "../types/BinaryDOMNode";

describe("BinaryDOMNode", () => {
  it("creates a valid node", () => {
    const node: BinaryDOMNode = {
      id: "1",
      type: "element",
      tagName: "div",
      props: { children: [] },
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
    expect(node.type).toBe("element");
    expect(node.children).toEqual([]);
  });
});
