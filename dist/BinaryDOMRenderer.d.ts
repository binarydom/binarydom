import { BinaryDOMNode } from "./types/BinaryDOMNode";
declare const PRIORITY: {
    readonly IMMEDIATE: 1;
    readonly USER_BLOCKING: 2;
    readonly NORMAL: 3;
    readonly LOW: 4;
    readonly IDLE: 5;
};
type PriorityLevel = (typeof PRIORITY)[keyof typeof PRIORITY];
export declare class BinaryDOMRenderer {
    private root;
    private container;
    private workInProgress;
    private nextUnitOfWork;
    private deletions;
    private currentRoot;
    private delegatedEvents;
    private pendingUpdates;
    private scheduled;
    private domNodeMap;
    private updateQueue;
    private currentPriority;
    constructor(container: Element);
    /**
     * Render a BinaryDOMNode into the container.
     */
    render(element: BinaryDOMNode): void;
    private scheduleWork;
    private workLoop;
    private performUnitOfWork;
    private updateFunctionComponent;
    private getComponentStack;
    private updateHostComponent;
    private reconcileChildren;
    private commitRoot;
    private commitWork;
    private commitDeletion;
    private createDom;
    private updateDom;
    private setupEventDelegation;
    private findNodeById;
    private scheduleUpdate;
    private commitBatchedUpdates;
    private createFiber;
    scheduleUpdateWithPriority(fiber: BinaryDOMNode, priority: PriorityLevel, callback: () => void): void;
    createElement(node: BinaryDOMNode): HTMLElement;
}
export {};
