/**
 * Supported node types for the Binary DOM.
 */
export type NodeType = "element" | "text" | "comment" | "document" | "fragment";
/**
 * Props for a BinaryDOMNode.
 */
export interface BinaryDOMProps {
    [key: string]: unknown;
    children?: BinaryDOMNode[];
    key?: string | number;
    ref?: (node: HTMLElement | Text | null) => void;
    style?: {
        [key: string]: string | number;
    };
    className?: string;
    dangerouslySetInnerHTML?: {
        __html: string;
    };
}
/**
 * Event handler type for DOM events.
 */
export type DOMEventHandler = (event: Event) => void;
/**
 * Type for hooks array (for useState, useEffect, etc.).
 */
export type Hook = unknown;
/**
 * The core BinaryDOMNode interface, supporting both host and fiber properties.
 */
export interface BinaryDOMNode {
    id: string;
    type: NodeType | Function;
    tagName?: string;
    props: BinaryDOMProps;
    attributes: Map<string, string>;
    children: BinaryDOMNode[];
    left: BinaryDOMNode | null;
    right: BinaryDOMNode | null;
    checksum: number;
    isDirty: boolean;
    parent: BinaryDOMNode | null;
    value?: string;
    key?: string | number;
    ref?: (node: HTMLElement | Text | null) => void;
    eventHandlers: Map<string, DOMEventHandler>;
    state: unknown;
    hooks: Hook[];
    fiber?: {
        alternate: BinaryDOMNode | null;
        child: BinaryDOMNode | null;
        sibling: BinaryDOMNode | null;
        return: BinaryDOMNode | null;
        pendingProps: BinaryDOMProps;
        memoizedProps: BinaryDOMProps;
        memoizedState: unknown;
        updateQueue: unknown;
        flags: number;
    };
    alternate?: BinaryDOMNode | null;
    child?: BinaryDOMNode | null;
    sibling?: BinaryDOMNode | null;
    return?: BinaryDOMNode | null;
    effectTag?: string;
    dom?: HTMLElement | Text | null;
}
/**
 * Options for BinaryDOM configuration.
 */
export interface BinaryDOMOptions {
    useChecksums?: boolean;
    batchUpdates?: boolean;
    maxBatchSize?: number;
}
