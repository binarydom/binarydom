"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryDOMRenderer = void 0;
const ErrorBoundary_1 = require("./components/ErrorBoundary");
// Priority levels
const PRIORITY = {
    IMMEDIATE: 1,
    USER_BLOCKING: 2,
    NORMAL: 3,
    LOW: 4,
    IDLE: 5,
};
// Simple priority queue for scheduled updates
class PriorityQueue {
    constructor() {
        this.queue = [];
    }
    enqueue(update) {
        this.queue.push(update);
        this.queue.sort((a, b) => a.priority - b.priority);
    }
    dequeue() {
        return this.queue.shift();
    }
    isEmpty() {
        return this.queue.length === 0;
    }
}
class BinaryDOMRenderer {
    constructor(container) {
        this.root = null;
        this.workInProgress = null;
        this.nextUnitOfWork = null;
        this.deletions = [];
        this.currentRoot = null;
        this.delegatedEvents = new Set();
        this.pendingUpdates = [];
        this.scheduled = false;
        this.domNodeMap = new WeakMap();
        this.updateQueue = new PriorityQueue();
        this.currentPriority = PRIORITY.NORMAL;
        this.container = container;
    }
    /**
     * Render a BinaryDOMNode into the container.
     */
    render(element) {
        this.workInProgress = {
            ...element,
            alternate: this.currentRoot,
            dom: this.currentRoot?.dom || null, // Carry over existing DOM node if updating root
        };
        this.nextUnitOfWork = this.workInProgress;
        this.deletions = [];
        // Initial render or update, clear pending updates before scheduling
        this.pendingUpdates = [];
        this.scheduled = false;
        this.scheduleWork(this.workLoop.bind(this));
    }
    scheduleWork(callback) {
        requestIdleCallback(callback);
    }
    workLoop(deadline) {
        let shouldYield = false;
        let unitsProcessed = 0;
        const MAX_UNITS_PER_FRAME = 50; // Tune for responsiveness
        // Process high-priority updates first
        while (!this.updateQueue.isEmpty() && !shouldYield) {
            const update = this.updateQueue.dequeue();
            if (update) {
                this.currentPriority = update.priority;
                update.callback();
                unitsProcessed++;
                shouldYield =
                    deadline.timeRemaining() < 1 || unitsProcessed >= MAX_UNITS_PER_FRAME;
            }
        }
        // Continue with fiber work if no high-priority updates
        while (this.nextUnitOfWork && !shouldYield) {
            this.nextUnitOfWork = this.performUnitOfWork(this.nextUnitOfWork);
            unitsProcessed++;
            shouldYield =
                deadline.timeRemaining() < 1 || unitsProcessed >= MAX_UNITS_PER_FRAME;
        }
        if (!this.nextUnitOfWork && this.workInProgress) {
            this.commitRoot();
        }
        if (this.nextUnitOfWork || !this.updateQueue.isEmpty()) {
            this.scheduleWork(this.workLoop.bind(this));
        }
        else if (this.pendingUpdates.length > 0) {
            this.commitBatchedUpdates();
        }
        else {
            this.scheduled = false;
        }
    }
    performUnitOfWork(fiber) {
        const isFunctionComponent = typeof fiber.type === "function";
        if (isFunctionComponent) {
            this.updateFunctionComponent(fiber);
        }
        else {
            this.updateHostComponent(fiber);
        }
        // Return next unit of work
        if (fiber.fiber?.child) {
            return fiber.fiber.child;
        }
        let nextFiber = fiber;
        while (nextFiber) {
            if (nextFiber.fiber?.sibling) {
                return nextFiber.fiber.sibling;
            }
            nextFiber = nextFiber.fiber?.return || null;
        }
        return null;
    }
    updateFunctionComponent(fiber) {
        try {
            const children = typeof fiber.type === "function"
                ? [fiber.type(fiber.props)]
                : [];
            this.reconcileChildren(fiber, children);
        }
        catch (error) {
            // Find the nearest error boundary
            const errorBoundary = ErrorBoundary_1.ErrorBoundary.findNearestErrorBoundary(fiber);
            if (errorBoundary) {
                // Let the error boundary handle the error
                errorBoundary.handleError(error, {
                    componentStack: this.getComponentStack(fiber),
                });
                // Re-render the error boundary with the fallback UI
                const fallbackNode = errorBoundary.render();
                this.reconcileChildren(fiber, [fallbackNode]);
            }
            else {
                // No error boundary found, mark as error and log
                fiber.effectTag = "ERROR";
                console.error("Uncaught error in function component:", error);
                console.error("Component stack:", this.getComponentStack(fiber));
            }
        }
    }
    getComponentStack(fiber) {
        const stack = [];
        let currentFiber = fiber;
        while (currentFiber) {
            const componentName = typeof currentFiber.type === "function"
                ? currentFiber.type.name || "Anonymous"
                : currentFiber.type;
            stack.unshift(componentName);
            currentFiber = currentFiber.fiber?.return || null;
        }
        return stack.join(" > ");
    }
    updateHostComponent(fiber) {
        if (!fiber.dom) {
            fiber.dom = this.createDom(fiber);
        }
        this.reconcileChildren(fiber, fiber.props.children || []);
    }
    reconcileChildren(wipFiber, elements) {
        // This is a simplified reconciliation. A full implementation
        // would compare old fibers (wipFiber.alternate?.fiber?.child) with new elements.
        // For now, we just create new fibers for the elements.
        let index = 0;
        let oldFiber = wipFiber.alternate?.fiber?.child || null; // Safely access old fiber child
        let prevSibling = null;
        const newFibers = [];
        const oldFiberMap = new Map();
        // Build a map of old fibers by key or index
        while (oldFiber) {
            oldFiberMap.set(oldFiber.key || index, oldFiber);
            oldFiber = oldFiber.fiber?.sibling || null;
            index++; // Use index as a fallback key if key is missing
        }
        index = 0; // Reset index for new elements
        oldFiber = wipFiber.alternate?.fiber?.child || null; // Reset oldFiber to the start
        while (index < elements.length || oldFiber != null) {
            const element = elements[index];
            let newFiber = null;
            // Compare oldFiber to element (simplified diffing)
            const sameType = oldFiber && element && element.type === oldFiber.type;
            const key = element?.key ?? index; // Use element key or index as key
            const matchedOldFiber = oldFiberMap.get(key);
            if (sameType && matchedOldFiber && oldFiber) {
                // Update the old fiber
                newFiber = {
                    type: typeof oldFiber.type === "string" ? oldFiber.type : oldFiber.type,
                    props: element.props,
                    dom: matchedOldFiber.dom, // Keep old DOM node
                    alternate: matchedOldFiber,
                    fiber: this.createFiber({
                        alternate: matchedOldFiber.fiber?.alternate,
                        child: null,
                        sibling: null,
                        return: wipFiber,
                        pendingProps: element.props,
                        memoizedProps: matchedOldFiber.props,
                        memoizedState: matchedOldFiber.state,
                        updateQueue: matchedOldFiber.fiber?.updateQueue,
                        flags: matchedOldFiber.fiber?.flags,
                    }),
                    effectTag: "UPDATE",
                    id: matchedOldFiber.id,
                    attributes: new Map(matchedOldFiber.attributes),
                    children: [],
                    left: matchedOldFiber.left,
                    right: matchedOldFiber.right,
                    checksum: matchedOldFiber.checksum,
                    isDirty: true,
                    value: matchedOldFiber.value,
                    key: element.key,
                    ref: element.ref,
                    eventHandlers: new Map(matchedOldFiber.eventHandlers),
                    state: matchedOldFiber.state,
                    hooks: matchedOldFiber.hooks,
                    parent: wipFiber,
                };
            }
            if (element && !sameType) {
                // New element, create new fiber
                newFiber = {
                    type: typeof element.type === "string" ? element.type : element.type,
                    props: element.props,
                    dom: null,
                    alternate: null,
                    fiber: this.createFiber({
                        alternate: null,
                        child: null,
                        sibling: null,
                        return: wipFiber,
                        pendingProps: element.props,
                        memoizedProps: {},
                        memoizedState: undefined,
                        updateQueue: null,
                        flags: 0,
                    }),
                    effectTag: "PLACEMENT",
                    id: Math.random().toString(36).substring(7),
                    attributes: new Map(),
                    children: [],
                    left: null,
                    right: null,
                    checksum: 0,
                    isDirty: true,
                    value: undefined,
                    key: element.key,
                    ref: element.ref,
                    eventHandlers: new Map(),
                    state: undefined,
                    hooks: [],
                    parent: wipFiber,
                };
            }
            // If there's an old fiber at the current index that wasn't matched by key,
            // or if we are past the new elements, mark the old fiber for deletion.
            if (oldFiber && (!matchedOldFiber || !element)) {
                oldFiber.effectTag = "DELETION"; // Mark for deletion - set at top level
                this.deletions.push(oldFiber);
            }
            if (oldFiber) {
                // Only advance oldFiber if it was matched (either by type/key or index) or if there's no corresponding new element
                if (matchedOldFiber && sameType) {
                    oldFiber = oldFiber.fiber?.sibling || null;
                }
                else if (!element) {
                    oldFiber = oldFiber.fiber?.sibling || null;
                }
                else {
                    // If oldFiber exists but wasn't matched by key and there's a new element,
                    // we don't advance oldFiber here. It will be considered for deletion later
                    // if it remains unmatched.
                }
            }
            else if (matchedOldFiber) {
                // If oldFiber is null but a matchedOldFiber exists (meaning the key changed position),
                // we don't advance oldFiber here as we're iterating based on the original sequence.
            }
            if (newFiber) {
                newFibers.push(newFiber);
            }
            // Set parent, and sibling relationships on the new fiber's fiber property
            if (index === 0 && newFiber) {
                wipFiber.fiber = this.createFiber({
                    ...wipFiber.fiber,
                    child: newFiber,
                });
            }
            else if (newFiber && prevSibling) {
                prevSibling.fiber = this.createFiber({
                    ...prevSibling.fiber,
                    sibling: newFiber,
                });
            }
            if (newFiber) {
                newFiber.fiber = this.createFiber({
                    ...newFiber.fiber,
                    return: wipFiber,
                });
                prevSibling = newFiber;
            }
            index++;
            // We only advance oldFiber if we processed a corresponding new element.
            // If !element, it means we are only processing remaining old fibers for deletion.
            // The oldFiber advancement logic inside the loop handles the different cases.
        }
        // Any remaining old fibers in the map were not matched and should be deleted
        oldFiberMap.forEach((fiberToDel) => {
            fiberToDel.effectTag = "DELETION"; // Mark for deletion - set at top level
            this.deletions.push(fiberToDel);
        });
        return newFibers;
    }
    commitRoot() {
        this.deletions.forEach((fiber) => this.commitDeletion(fiber)); // Pass only the fiber
        if (this.workInProgress?.fiber?.child) {
            this.commitWork(this.workInProgress.fiber.child);
        }
        this.currentRoot = this.workInProgress;
        this.workInProgress = null;
        this.commitBatchedUpdates(); // Commit all pending DOM updates after tree traversal
    }
    commitWork(fiber) {
        if (!fiber)
            return;
        let domParentFiber = fiber.fiber?.return;
        while (domParentFiber && !domParentFiber.dom) {
            domParentFiber = domParentFiber.fiber?.return;
        }
        const domParent = domParentFiber?.dom;
        this.scheduleUpdate(() => {
            if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
                domParent.appendChild(fiber.dom);
            }
            else if (fiber.effectTag === "UPDATE" && fiber.dom) {
                if (fiber.alternate) {
                    this.updateDom(fiber.dom, fiber.alternate.props, fiber.props);
                }
            }
            else if (fiber.effectTag === "DELETION") {
                // Deletion handled in commitDeletion
            }
        });
        if (fiber.fiber?.child)
            this.commitWork(fiber.fiber.child);
        if (fiber.fiber?.sibling)
            this.commitWork(fiber.fiber.sibling);
    }
    commitDeletion(fiber, domParent) {
        // If domParent is not provided, find it by traversing up the fiber tree
        let actualDomParent = domParent;
        if (!actualDomParent) {
            let domParentFiber = fiber.fiber?.return;
            while (domParentFiber && !domParentFiber.dom) {
                domParentFiber = domParentFiber.fiber?.return;
            }
            actualDomParent = domParentFiber?.dom;
        }
        if (!actualDomParent) {
            // If no DOM parent found, cannot delete DOM node. Log error or handle appropriately.
            console.error("Cannot find DOM parent for deletion", fiber);
            // Continue deleting children in case they have DOM nodes with valid parents
            if (fiber.fiber?.child) {
                this.commitDeletion(fiber.fiber.child, actualDomParent);
            }
            return;
        }
        this.scheduleUpdate(() => {
            if (fiber.dom) {
                actualDomParent?.removeChild(fiber.dom);
            }
            else if (fiber.fiber?.child) {
                // If no DOM, continue deletion down the tree, passing the found domParent
                this.commitDeletion(fiber.fiber.child, actualDomParent);
            }
        });
    }
    createDom(fiber) {
        const textContent = typeof fiber.props?.text === "string"
            ? fiber.props.text
            : typeof fiber.value === "string"
                ? fiber.value
                : "";
        const dom = fiber.type === "text"
            ? document.createTextNode(textContent)
            : document.createElement(fiber.type);
        if (dom instanceof HTMLElement) {
            dom.setAttribute("data-binary-id", fiber.id);
            this.updateDom(dom, {}, fiber.props);
            this.domNodeMap.set(dom, fiber);
        }
        // Setup event delegation for this node's event handlers
        if (dom instanceof HTMLElement && fiber.eventHandlers) {
            fiber.eventHandlers.forEach((handler, eventType) => {
                this.setupEventDelegation(eventType);
            });
        }
        return dom;
    }
    updateDom(dom, prevProps, nextProps) {
        // Helper to check if a prop is an event listener
        const isEvent = (key) => key.startsWith("on");
        // Update Attributes and Properties
        Object.keys(nextProps).forEach((key) => {
            if (key === "children" || isEvent(key))
                return; // Handled elsewhere
            const prevValue = prevProps[key];
            const nextValue = nextProps[key];
            if (prevValue !== nextValue) {
                if (key === "style") {
                    // Handle style object
                    const prevStyle = (prevValue || {});
                    const nextStyle = (nextValue || {});
                    // Remove old style properties
                    Object.keys(prevStyle).forEach((styleKey) => {
                        // Check if the style key exists in nextStyle and is not null/undefined
                        if (!(styleKey in nextStyle) ||
                            nextStyle[styleKey] === undefined ||
                            nextStyle[styleKey] === null) {
                            dom.style.removeProperty(styleKey);
                        }
                    });
                    // Set new or changed style properties
                    Object.keys(nextStyle).forEach((styleKey) => {
                        const nextStyleValue = nextStyle[styleKey];
                        // Only set if the value is a string or number and is different
                        if (typeof nextStyleValue === "string" ||
                            typeof nextStyleValue === "number") {
                            const prevStyleValue = prevStyle[styleKey];
                            if (prevStyleValue !== nextStyleValue) {
                                dom.style.setProperty(styleKey, String(nextStyleValue));
                            }
                        }
                        else if (nextStyleValue === null ||
                            nextStyleValue === undefined) {
                            // Ensure null/undefined removes the property even if it was in prevStyle
                            dom.style.removeProperty(styleKey);
                        }
                    });
                }
                else if (key === "className") {
                    // Handle className property
                    dom.className = nextValue || "";
                }
                else if (key === "value" && dom instanceof HTMLInputElement) {
                    // Handle value property for inputs
                    dom.value = nextValue || "";
                }
                else if (key === "checked" && dom instanceof HTMLInputElement) {
                    // Handle checked property for checkboxes
                    dom.checked = Boolean(nextValue);
                }
                else if (nextValue === null || nextValue === undefined) {
                    // Remove attribute if null or undefined
                    dom.removeAttribute(key);
                }
                else if (typeof nextValue !== "object" &&
                    typeof nextValue !== "function") {
                    // Set other simple values as attributes
                    dom.setAttribute(key, String(nextValue));
                }
                else {
                    // Handle complex props by setting directly on the DOM object if possible
                    try {
                        dom[key] = nextValue;
                    }
                    catch { } // Attempt to set property
                }
            }
        });
        // Remove Old Attributes and Properties
        Object.keys(prevProps).forEach((key) => {
            if (key === "children" || isEvent(key))
                return; // Handled elsewhere
            // If the key is not in nextProps (or is explicitly undefined/null in nextProps),
            // ensure it's removed from the DOM.
            if (!(key in nextProps) ||
                nextProps[key] === undefined ||
                nextProps[key] === null) {
                if (key === "style") {
                    // Remove all old style properties if style object is gone or null/undefined
                    const prevStyle = (prevProps[key] || {});
                    Object.keys(prevStyle).forEach((styleKey) => {
                        dom.style.removeProperty(styleKey);
                    });
                }
                else if (key === "className") {
                    dom.className = "";
                }
                else if (key === "value" && dom instanceof HTMLInputElement) {
                    dom.value = ""; // Clear value
                }
                else if (key === "checked" && dom instanceof HTMLInputElement) {
                    dom.checked = false; // Uncheck
                }
                else if (dom.hasAttribute(key)) {
                    dom.removeAttribute(key);
                }
                else {
                    // Attempt to clear property if attribute wasn't removed
                    try {
                        dom[key] = null;
                    }
                    catch { }
                }
            }
        });
        // Event handlers are primarily managed by the delegation system setup in createDom.
        // We need to ensure the fiber's eventHandlers map is up-to-date during reconciliation.
        // The delegation logic then reads from the current fiber via the domNodeMap lookup.
        // So no direct event listener manipulation needed here if delegation is used.
    }
    setupEventDelegation(eventType) {
        if (this.delegatedEvents.has(eventType))
            return;
        this.delegatedEvents.add(eventType);
        this.container.addEventListener(eventType, (event) => {
            let target = event.target;
            while (target && target !== this.container) {
                // Use WeakMap for faster lookup if possible, fallback to data attribute
                const node = this.domNodeMap.get(target) ||
                    this.findNodeById(target.getAttribute("data-binary-id") || "", this.currentRoot);
                if (node && node.eventHandlers.has(eventType)) {
                    node.eventHandlers.get(eventType)(event);
                    // Stop propagation if handler returns false or explicitly calls stopPropagation
                    if (event.isPropagationStopped)
                        break; // Custom flag for stopPropagation
                    if (event._binarydom_stopPropagation)
                        break; // Another custom flag example
                }
                target = target.parentElement;
            }
        });
    }
    findNodeById(id, node) {
        if (!node || !id)
            return null;
        // Fallback lookup, prefer WeakMap
        if (node.id === id)
            return node;
        // Simple depth-first search - could be optimized with a map during build
        if (node.fiber?.child) {
            const found = this.findNodeById(id, node.fiber.child);
            if (found)
                return found;
        }
        if (node.fiber?.sibling) {
            const found = this.findNodeById(id, node.fiber.sibling);
            if (found)
                return found;
        }
        return null;
    }
    scheduleUpdate(fn) {
        this.pendingUpdates.push(fn);
        if (!this.scheduled) {
            this.scheduled = true;
            requestAnimationFrame(() => {
                this.commitBatchedUpdates();
            });
        }
    }
    commitBatchedUpdates() {
        this.pendingUpdates.forEach((f) => f());
        this.pendingUpdates = [];
        this.scheduled = false;
        // After committing DOM updates, check if there is still work to do
        if (this.nextUnitOfWork) {
            this.scheduleWork(this.workLoop.bind(this));
        }
    }
    // Helper to create a complete fiber object with all required properties
    createFiber(props) {
        return {
            alternate: props.alternate ?? null,
            child: props.child ?? null,
            sibling: props.sibling ?? null,
            return: props.return ?? null,
            pendingProps: props.pendingProps ?? {},
            memoizedProps: props.memoizedProps ?? {},
            memoizedState: props.memoizedState ?? undefined,
            updateQueue: props.updateQueue ?? null,
            flags: props.flags ?? 0,
        };
    }
    // Schedule an update with a given priority
    scheduleUpdateWithPriority(fiber, priority, callback) {
        this.updateQueue.enqueue({ fiber, priority, callback });
        if (!this.scheduled) {
            this.scheduled = true;
            this.scheduleWork(this.workLoop.bind(this));
        }
    }
    createElement(node) {
        const element = document.createElement(node.type);
        element.setAttribute('data-binary-id', node.id);
        // Set attributes
        node.attributes.forEach((value, key) => {
            element.setAttribute(key, value);
        });
        return element;
    }
}
exports.BinaryDOMRenderer = BinaryDOMRenderer;
function isFunctionComponent(node) {
    return typeof node.type === "function";
}
