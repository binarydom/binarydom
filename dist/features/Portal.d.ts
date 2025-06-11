import { BinaryDOMNode } from "../types/BinaryDOMNode";
import { BinaryDOMRenderer } from "../BinaryDOMRenderer";
export declare class Portal {
    private static portals;
    private static renderer;
    static initialize(renderer: BinaryDOMRenderer): void;
    static createPortal(node: BinaryDOMNode, container: HTMLElement | string): BinaryDOMNode;
    static renderPortal(portalNode: BinaryDOMNode): void;
    static removePortal(portalId: string): void;
}
