import { BinaryDOMNode } from "../types/BinaryDOMNode";
export declare class BinaryDOMServer {
    private static instance;
    private cache;
    private constructor();
    static getInstance(): BinaryDOMServer;
    /**
     * Renders a BinaryDOMNode tree to an HTML string.
     * @param node The root BinaryDOMNode.
     * @param initialState Optional initial state to embed in the HTML for hydration.
     * @returns The rendered HTML string.
     */
    renderToString(node: BinaryDOMNode, initialState?: any): string;
    private renderElement;
    private renderAttributes;
    private renderChildren;
    private generateCacheKey;
    private escapeHtml;
    clearCache(): void;
}
