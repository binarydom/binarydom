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
  private nodePool: BinaryDOMNode[] = [];
  private maxPoolSize: number = 1000;

  constructor(options: BinaryDOMOptions = {}) {
    this.options = {
      useChecksums: true,
      batchUpdates: true,
      maxBatchSize: 1000,
      ...options,
    };
    this.startCleanupInterval();
  }

  async initialize() {
    this.hashFunction = await xxhash();
  }

  private getNodeFromPool(): BinaryDOMNode {
    if (this.nodePool.length > 0) {
      return this.nodePool.pop()!;
    }
    return this.createNode("element");
  }

  private returnNodeToPool(node: BinaryDOMNode) {
    if (this.nodePool.length < this.maxPoolSize) {
      // Reset node state
      node.left = null;
      node.right = null;
      node.parent = null;
      node.children = [];
      node.attributes.clear();
      node.eventHandlers.clear();
      node.hooks = [];
      node.state = null;
      node.isDirty = false;
      node.checksum = 0;
      
      this.nodePool.push(node);
    }
  }

  private cleanupUnusedNodes(node: BinaryDOMNode | null) {
    if (!node) return;
    
    // Recursively cleanup children
    if (node.left) {
      this.cleanupUnusedNodes(node.left);
    }
    if (node.right) {
      this.cleanupUnusedNodes(node.right);
    }
    
    // Check if node is still in use
    if (!node.isDirty && !this.isNodeReferenced(node)) {
      this.returnNodeToPool(node);
    }
  }

  private isNodeReferenced(node: BinaryDOMNode): boolean {
    // Check if node is referenced by any event handlers or state
    return node.eventHandlers.size > 0 || 
           node.hooks.length > 0 || 
           node.state !== null;
  }

  private createNode(
    type: NodeType,
    tagName?: string,
    value?: string
  ): BinaryDOMNode {
    const node = this.getNodeFromPool();
    
    // Initialize node properties
    node.id = Math.random().toString(36).substring(2, 11);
    node.type = type;
    node.tagName = tagName;
    node.value = value;
    
    return node;
  }

  private startCleanupInterval() {
    setInterval(() => {
      if (this.root) {
        this.cleanupUnusedNodes(this.root);
      }
    }, 5000); // Run cleanup every 5 seconds
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

  private balanceTree(node: BinaryDOMNode): BinaryDOMNode {
    const balance = this.getBalance(node);
    
    // Left Left Case
    if (balance > 1 && this.getBalance(node.left!) < 0) {
      node.left = this.rotateLeft(node.left!);
      return this.rotateRight(node);
    }
    
    // Right Right Case
    if (balance < -1 && this.getBalance(node.right!) > 0) {
      node.right = this.rotateRight(node.right!);
      return this.rotateLeft(node);
    }
    
    // Left Right Case
    if (balance > 1 && this.getBalance(node.left!) >= 0) {
      return this.rotateRight(node);
    }
    
    // Right Left Case
    if (balance < -1 && this.getBalance(node.right!) <= 0) {
      return this.rotateLeft(node);
    }
    
    return node;
  }

  private getBalance(node: BinaryDOMNode): number {
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  private getHeight(node: BinaryDOMNode | null): number {
    if (!node) return 0;
    return 1 + Math.max(
      this.getHeight(node.left),
      this.getHeight(node.right)
    );
  }

  private rotateRight(node: BinaryDOMNode): BinaryDOMNode {
    const left = node.left!;
    const rightOfLeft = left.right;
    
    left.right = node;
    node.left = rightOfLeft;
    
    return left;
  }

  private rotateLeft(node: BinaryDOMNode): BinaryDOMNode {
    const right = node.right!;
    const leftOfRight = right.left;
    
    right.left = node;
    node.right = leftOfRight;
    
    return right;
  }

  public buildBinaryTree(element: Element): BinaryDOMNode {
    const node = this.createNode("element", element.tagName.toLowerCase());

    // Copy attributes
    Array.from(element.attributes).forEach((attr) => {
      node.attributes.set(attr.name, attr.value);
    });

    // Process children with balanced tree
    const children = Array.from(element.children);
    if (children.length > 0) {
      const mid = Math.floor(children.length / 2);
      node.left = this.buildBinaryTree(children[mid]);
      node.left.parent = node;
      
      // Process left subtree
      for (let i = mid - 1; i >= 0; i--) {
        const leftNode = this.buildBinaryTree(children[i]);
        leftNode.parent = node;
        node.left = this.balanceTree(node.left);
      }
      
      // Process right subtree
      for (let i = mid + 1; i < children.length; i++) {
        const rightNode = this.buildBinaryTree(children[i]);
        rightNode.parent = node;
        node.right = this.balanceTree(node.right);
      }
    }

    // Store original children for reconstruction
    node.children = children.map((child) => this.buildBinaryTree(child));

    // Compute checksum
    node.checksum = this.computeChecksum(node);

    return this.balanceTree(node);
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
