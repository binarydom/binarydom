import { BinaryDOMNode, BinaryDOMOptions } from "./types/BinaryDOMNode";
export declare class BinaryDOM {
    root: BinaryDOMNode | null;
    private options;
    private hashFunction;
    constructor(options?: BinaryDOMOptions);
    initialize(): Promise<void>;
    private createNode;
    private computeChecksum;
    buildBinaryTree(element: Element): BinaryDOMNode;
    mount(element: Element): void;
    diff(oldTree: BinaryDOMNode, newTree: BinaryDOMNode): any[];
    patch(changes: any[]): void;
    private batchPatch;
    private applyChange;
}
