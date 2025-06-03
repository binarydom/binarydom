import { BinaryDOMNode } from "../types/BinaryDOMNode";

export class BinaryDOMServer {
  private static instance: BinaryDOMServer;
  private cache: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): BinaryDOMServer {
    if (!this.instance) {
      this.instance = new BinaryDOMServer();
    }
    return this.instance;
  }

  renderToString(node: BinaryDOMNode): string {
    const cacheKey = this.generateCacheKey(node);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let html = "";

    switch (node.type) {
      case "element":
        html = this.renderElement(node);
        break;
      case "text":
        html = this.escapeHtml(node.value || "");
        break;
      case "fragment":
        html = this.renderChildren(node);
        break;
      default:
        html = "";
    }

    this.cache.set(cacheKey, html);
    return html;
  }

  private renderElement(node: BinaryDOMNode): string {
    const tagName = node.tagName || "div";
    const attributes = this.renderAttributes(node);
    const children = this.renderChildren(node);

    return `<${tagName}${attributes}>${children}</${tagName}>`;
  }

  private renderAttributes(node: BinaryDOMNode): string {
    const attrs: string[] = [];

    // Add data attributes for hydration
    attrs.push(`data-binary-id="${node.id}"`);

    // Add regular attributes
    node.attributes.forEach((value, key) => {
      attrs.push(`${key}="${this.escapeHtml(value)}"`);
    });

    // Add props as data attributes
    Object.entries(node.props).forEach(([key, value]) => {
      if (key !== "children" && typeof value !== "function") {
        attrs.push(
          `data-prop-${key}="${this.escapeHtml(JSON.stringify(value))}"`
        );
      }
    });

    return attrs.length ? " " + attrs.join(" ") : "";
  }

  private renderChildren(node: BinaryDOMNode): string {
    return node.children.map((child) => this.renderToString(child)).join("");
  }

  private generateCacheKey(node: BinaryDOMNode): string {
    return `${node.id}-${node.checksum}`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  clearCache() {
    this.cache.clear();
  }
}
