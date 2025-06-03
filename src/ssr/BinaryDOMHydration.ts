import { BinaryDOMNode } from "../types/BinaryDOMNode";
import { BinaryDOMRenderer } from "../BinaryDOMRenderer";

export class BinaryDOMHydration {
  private static instance: BinaryDOMHydration;
  private renderer: BinaryDOMRenderer;

  private constructor(renderer: BinaryDOMRenderer) {
    this.renderer = renderer;
  }

  static getInstance(renderer: BinaryDOMRenderer): BinaryDOMHydration {
    if (!this.instance) {
      this.instance = new BinaryDOMHydration(renderer);
    }
    return this.instance;
  }

  hydrate(node: BinaryDOMNode, container: HTMLElement) {
    const existingNodes = this.findExistingNodes(container);
    this.hydrateNode(node, container, existingNodes);
  }

  private hydrateNode(
    node: BinaryDOMNode,
    parentElement: HTMLElement,
    existingNodes: Map<string, HTMLElement>
  ) {
    const existingElement = existingNodes.get(node.id);

    if (existingElement) {
      // Update attributes and props
      this.updateAttributes(existingElement, node);
      this.updateProps(existingElement, node);

      // Hydrate children
      const childElements = Array.from(existingElement.children);
      node.children.forEach((child, index) => {
        if (childElements[index]) {
          this.hydrateNode(child, existingElement, existingNodes);
        } else {
          // Create new element if it doesn't exist
          const newElement = this.renderer.createElement(child);
          existingElement.appendChild(newElement);
        }
      });

      // Remove extra elements
      while (existingElement.children.length > node.children.length) {
        existingElement.removeChild(existingElement.lastChild!);
      }
    } else {
      // Create new element if it doesn't exist
      const newElement = this.renderer.createElement(node);
      parentElement.appendChild(newElement);
    }
  }

  private findExistingNodes(container: HTMLElement): Map<string, HTMLElement> {
    const nodes = new Map<string, HTMLElement>();
    const elements = container.querySelectorAll("[data-binary-id]");

    elements.forEach((element) => {
      const id = element.getAttribute("data-binary-id");
      if (id) {
        nodes.set(id, element as HTMLElement);
      }
    });

    return nodes;
  }

  private updateAttributes(element: HTMLElement, node: BinaryDOMNode) {
    // Remove all existing attributes
    Array.from(element.attributes).forEach((attr) => {
      if (!attr.name.startsWith("data-binary-")) {
        element.removeAttribute(attr.name);
      }
    });

    // Add new attributes
    node.attributes.forEach((value, key) => {
      element.setAttribute(key, value);
    });
  }

  private updateProps(element: HTMLElement, node: BinaryDOMNode) {
    // Update props from data attributes
    Array.from(element.attributes)
      .filter((attr) => attr.name.startsWith("data-prop-"))
      .forEach((attr) => {
        const propName = attr.name.replace("data-prop-", "");
        try {
          const value = JSON.parse(attr.value);
          (element as any)[propName] = value;
        } catch (e) {
          console.warn(`Failed to parse prop ${propName}:`, e);
        }
      });
  }
}
