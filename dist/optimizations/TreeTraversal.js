"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizedTreeTraversal = void 0;
class OptimizedTreeTraversal {
    static traverse(node, callback) {
        const cacheKey = node.id;
        if (this.traversalCache.has(cacheKey)) {
            this.traversalCache.get(cacheKey).forEach(callback);
            return;
        }
        const visited = [];
        const stack = [node];
        while (stack.length > 0) {
            const current = stack.pop();
            visited.push(current);
            callback(current);
            // Use binary tree structure for efficient traversal
            if (current.right)
                stack.push(current.right);
            if (current.left)
                stack.push(current.left);
        }
        // Cache the traversal result
        if (this.traversalCache.size >= this.CACHE_SIZE) {
            const firstKey = this.traversalCache.keys().next().value;
            if (firstKey)
                this.traversalCache.delete(firstKey);
        }
        this.traversalCache.set(cacheKey, visited);
    }
    static findNode(root, predicate) {
        const cacheKey = `${root.id}-${predicate.toString()}`;
        if (this.nodeCache.has(cacheKey)) {
            return this.nodeCache.get(cacheKey);
        }
        let result = null;
        this.traverse(root, (node) => {
            if (!result && predicate(node)) {
                result = node;
            }
        });
        if (result) {
            if (this.nodeCache.size >= this.CACHE_SIZE) {
                const firstKey = this.nodeCache.keys().next().value;
                if (firstKey)
                    this.nodeCache.delete(firstKey);
            }
            this.nodeCache.set(cacheKey, result);
        }
        return result;
    }
    static findNodes(root, predicate) {
        const results = [];
        this.traverse(root, (node) => {
            if (predicate(node)) {
                results.push(node);
            }
        });
        return results;
    }
    static clearCache() {
        this.nodeCache.clear();
        this.traversalCache.clear();
    }
}
exports.OptimizedTreeTraversal = OptimizedTreeTraversal;
OptimizedTreeTraversal.CACHE_SIZE = 1000;
OptimizedTreeTraversal.nodeCache = new Map();
OptimizedTreeTraversal.traversalCache = new Map();
