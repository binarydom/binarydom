import { BinaryDOMNode, NodeType } from "../types/BinaryDOMNode";

export class BinaryDOMCompiler {
  private static instance: BinaryDOMCompiler;
  private constructor() {}

  static getInstance(): BinaryDOMCompiler {
    if (!BinaryDOMCompiler.instance) {
      BinaryDOMCompiler.instance = new BinaryDOMCompiler();
    }
    return BinaryDOMCompiler.instance;
  }

  compile(element: any): BinaryDOMNode {
    if (typeof element === "string" || typeof element === "number") {
      return this.createTextNode(String(element));
    }

    if (!element || typeof element !== "object") {
      return this.createTextNode("");
    }

    const { type, props = {}, children = [] } = element;

    if (typeof type === "function") {
      return this.compileComponent(type, props);
    }

    return this.createElement(type, props, children);
  }

  private createTextNode(value: string): BinaryDOMNode {
    return {
      id: Math.random().toString(36).substring(2, 11),
      type: "text",
      props: {},
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
      value,
    };
  }

  private createElement(
    type: string,
    props: any,
    children: any[]
  ): BinaryDOMNode {
    const node: BinaryDOMNode = {
      id: Math.random().toString(36).substring(2, 11),
      type: "element",
      tagName: type,
      props,
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
    };

    // Process props
    Object.entries(props).forEach(([key, value]) => {
      if (key.startsWith("on") && typeof value === "function") {
        node.eventHandlers.set(key.toLowerCase(), value);
      } else if (key === "className") {
        node.attributes.set("class", String(value));
      } else if (key !== "children") {
        node.attributes.set(key, String(value));
      }
    });

    // Process children
    const compiledChildren = this.compileChildren(children);
    node.children = compiledChildren;

    // Set up binary tree structure
    if (compiledChildren.length > 0) {
      node.left = compiledChildren[0];
      node.left.parent = node;

      let current = node.left;
      for (let i = 1; i < compiledChildren.length; i++) {
        current.right = compiledChildren[i];
        current.right.parent = current;
        current = current.right;
      }
    }

    return node;
  }

  private compileComponent(Component: Function, props: any): BinaryDOMNode {
    const instance = new (Component as any)(props);
    const result = instance.render();
    return this.compile(result);
  }

  private compileChildren(children: any[]): BinaryDOMNode[] {
    return children
      .flat()
      .filter((child) => child != null)
      .map((child) => this.compile(child));
  }
}

// JSX factory function
export function createElement(
  type: string | Function,
  props: any,
  ...children: any[]
): BinaryDOMNode {
  return BinaryDOMCompiler.getInstance().compile({ type, props, children });
}
