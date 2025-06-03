import { BinaryDOMServer } from "../ssr/BinaryDOMServer";
import { BinaryDOMNode } from "../types/BinaryDOMNode";

describe("BinaryDOMServer", () => {
  it("renders to string", () => {
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
    const server = BinaryDOMServer.getInstance();
    const html = server.renderToString(node);
    expect(html).toContain("<div");
  });
});
