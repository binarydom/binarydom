import { BinaryDOMNode } from "../types/BinaryDOMNode";
export declare class OptimizedTreeTraversal {
    private static readonly CACHE_SIZE;
    private static nodeCache;
    private static traversalCache;
    static traverse(node: BinaryDOMNode, callback: (node: BinaryDOMNode) => void): void;
    static findNode(root: BinaryDOMNode, predicate: (node: BinaryDOMNode) => boolean): BinaryDOMNode | null;
    static findNodes(root: BinaryDOMNode, predicate: (node: BinaryDOMNode) => boolean): BinaryDOMNode[];
    static clearCache(): void;
}
