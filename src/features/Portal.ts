import { BinaryDOMNode } from "../types/BinaryDOMNode";
import { BinaryDOMRenderer } from "../BinaryDOMRenderer";

export class Portal {
  private static portals = new Map<string, HTMLElement>();
  private static renderer: BinaryDOMRenderer;

  static initialize(renderer: BinaryDOMRenderer) {
    this.renderer = renderer;
  }

  static createPortal(
    node: BinaryDOMNode,
    container: HTMLElement | string
  ): BinaryDOMNode {
    const containerElement =
      typeof container === "string"
        ? document.getElementById(container)
        : container;

    if (!containerElement) {
      throw new Error("Portal container not found");
    }

    const portalId = Math.random().toString(36).substring(2, 11);
    this.portals.set(portalId, containerElement);

    // Create a portal node
    const portalNode: BinaryDOMNode = {
      id: portalId,
      type: "portal",
      props: {},
      attributes: new Map(),
      children: [node],
      left: null,
      right: null,
      parent: null,
      checksum: 0,
      isDirty: false,
      eventHandlers: new Map(),
      state: null,
      hooks: [],
      portalContainer: containerElement,
    };

    return portalNode;
  }

  static renderPortal(portalNode: BinaryDOMNode) {
    const container = this.portals.get(portalNode.id);
    if (!container) return;

    // Create a new renderer for the portal
    const portalRenderer = new BinaryDOMRenderer(container);
    portalRenderer.render(portalNode.children[0]);
  }

  static removePortal(portalId: string) {
    const container = this.portals.get(portalId);
    if (container) {
      container.innerHTML = "";
      this.portals.delete(portalId);
    }
  }
}
