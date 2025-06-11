import { BinaryDOMNode } from "../types/BinaryDOMNode";
import { BinaryDOMRenderer } from "../BinaryDOMRenderer";
export declare class BinaryDOMHydration {
    private static instance;
    private renderer;
    private constructor();
    static getInstance(renderer: BinaryDOMRenderer): BinaryDOMHydration;
    hydrate(node: BinaryDOMNode, container: HTMLElement): void;
    private hydrateNode;
    private findExistingNodes;
    private updateAttributes;
    private updateProps;
}
