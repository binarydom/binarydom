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

  /**
   * Renders a BinaryDOMNode tree to an HTML string.
   * @param node The root BinaryDOMNode.
   * @param initialState Optional initial state to embed in the HTML for hydration.
   * @returns The rendered HTML string.
   */
  renderToString(node: BinaryDOMNode, initialState?: any): string {
    const cacheKey = this.generateCacheKey(node);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let html = "";

    // Handle function components on the server
    if (typeof node.type === "function") {
      try {
        // Execute the function component
        const result = (node.type as Function)(node.props);
        // Recursively render the result
        if (result) {
          // Handle potential array returns from function components (like fragments)
          if (Array.isArray(result)) {
            html = result.map((child) => this.renderToString(child)).join("");
          } else {
            html = this.renderToString(result);
          }
        }
      } catch (error) {
        console.error(
          `Error rendering function component ${
            node.type.name || "anonymous"
          }:`,
          error
        );
        // Optionally render an error fallback or an empty string
        html = "<!-- Server Render Error -->";
      }
    } else {
      // Handle host elements
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
        // No default case here, undefined types will result in empty html
      }
    }

    // Embed initial state for hydration
    if (initialState !== undefined) {
      html += `<script>window.__BINARYDOM_INITIAL_STATE__ = ${this.escapeHtml(
        JSON.stringify(initialState)
      )};</script>`;
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
