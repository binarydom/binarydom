import {
  BinaryDOMNode,
  BinaryDOMOptions,
  NodeType,
} from "./types/BinaryDOMNode";
import xxhash from "xxhash-wasm";

export class BinaryDOM {
  public root: BinaryDOMNode | null = null;
  private options: BinaryDOMOptions;
  private hashFunction: any;

  constructor(options: BinaryDOMOptions = {}) {
    this.options = {
      useChecksums: true,
      batchUpdates: true,
      maxBatchSize: 1000,
      ...options,
    };
  }

  async initialize() {
    this.hashFunction = await xxhash();
  }

  private createNode(
    type: NodeType,
    tagName?: string,
    value?: string
  ): BinaryDOMNode {
    return {
      id: Math.random().toString(36).substring(2, 11),
      type,
      tagName,
      props: {},
      attributes: new Map(),
      children: [],
      left: null,
      right: null,
      checksum: 0,
      isDirty: false,
      parent: null,
      value,
      eventHandlers: new Map(),
      state: null,
      hooks: [],
    };
  }

  private computeChecksum(node: BinaryDOMNode): number {
    if (!this.options.useChecksums) return 0;

    const data = JSON.stringify({
      type: node.type,
      tagName: node.tagName,
      attributes: Array.from(node.attributes.entries()),
      value: node.value,
    });

    return this.hashFunction(data);
  }

  public buildBinaryTree(element: Element): BinaryDOMNode {
    const node = this.createNode("element", element.tagName.toLowerCase());

    // Copy attributes
    Array.from(element.attributes).forEach((attr) => {
      node.attributes.set(attr.name, attr.value);
    });

    // Process children
    const children = Array.from(element.children);
    if (children.length > 0) {
      node.left = this.buildBinaryTree(children[0]);
      node.left.parent = node;

      let current = node.left;
      for (let i = 1; i < children.length; i++) {
        current.right = this.buildBinaryTree(children[i]);
        current.right.parent = current;
        current = current.right;
      }
    }

    // Store original children for reconstruction
    node.children = children.map((child) => this.buildBinaryTree(child));

    // Compute checksum
    node.checksum = this.computeChecksum(node);

    return node;
  }

  public mount(element: Element) {
    this.root = this.buildBinaryTree(element);
  }

  public diff(oldTree: BinaryDOMNode, newTree: BinaryDOMNode): any[] {
    const changes: any[] = [];

    if (oldTree.checksum !== newTree.checksum) {
      // Compare attributes
      if (oldTree.type === "element" && newTree.type === "element") {
        for (const [key, value] of newTree.attributes) {
          if (oldTree.attributes.get(key) !== value) {
            changes.push({
              type: "UPDATE_ATTRIBUTE",
              node: oldTree,
              attribute: key,
              value,
            });
          }
        }
      }

      // Compare children
      if (oldTree.left && newTree.left) {
        changes.push(...this.diff(oldTree.left, newTree.left));
      }
      if (oldTree.right && newTree.right) {
        changes.push(...this.diff(oldTree.right, newTree.right));
      }
    }

    return changes;
  }

  public patch(changes: any[]) {
    if (this.options.batchUpdates) {
      this.batchPatch(changes);
    } else {
      changes.forEach((change) => this.applyChange(change));
    }
  }

  private batchPatch(changes: any[]) {
    const batches = [];
    let currentBatch = [];

    for (const change of changes) {
      currentBatch.push(change);
      if (currentBatch.length >= this.options.maxBatchSize!) {
        batches.push(currentBatch);
        currentBatch = [];
      }
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    batches.forEach((batch) => {
      requestAnimationFrame(() => {
        batch.forEach((change) => this.applyChange(change));
      });
    });
  }

  private applyChange(change: any) {
    // Implementation for applying changes to the real DOM
    // This will be implemented based on the specific change type
  }
}
