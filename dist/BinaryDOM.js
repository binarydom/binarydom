"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryDOM = void 0;
const xxhash_wasm_1 = __importDefault(require("xxhash-wasm"));
class BinaryDOM {
    constructor(options = {}) {
        this.root = null;
        this.options = {
            useChecksums: true,
            batchUpdates: true,
            maxBatchSize: 1000,
            ...options,
        };
    }
    async initialize() {
        this.hashFunction = await (0, xxhash_wasm_1.default)();
    }
    createNode(type, tagName, value) {
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
    computeChecksum(node) {
        if (!this.options.useChecksums)
            return 0;
        const data = JSON.stringify({
            type: node.type,
            tagName: node.tagName,
            attributes: Array.from(node.attributes.entries()),
            value: node.value,
        });
        return this.hashFunction(data);
    }
    buildBinaryTree(element) {
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
    mount(element) {
        this.root = this.buildBinaryTree(element);
    }
    diff(oldTree, newTree) {
        const changes = [];
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
    patch(changes) {
        if (this.options.batchUpdates) {
            this.batchPatch(changes);
        }
        else {
            changes.forEach((change) => this.applyChange(change));
        }
    }
    batchPatch(changes) {
        const batches = [];
        let currentBatch = [];
        for (const change of changes) {
            currentBatch.push(change);
            if (currentBatch.length >= this.options.maxBatchSize) {
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
    applyChange(change) {
        // Implementation for applying changes to the real DOM
        // This will be implemented based on the specific change type
    }
}
exports.BinaryDOM = BinaryDOM;
