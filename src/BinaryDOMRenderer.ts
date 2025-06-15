import { BinaryDOMNode, BinaryDOMProps } from "./types/BinaryDOMNode";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Priority levels
const PRIORITY = {
  IMMEDIATE: 1,
  USER_BLOCKING: 2,
  NORMAL: 3,
  LOW: 4,
  IDLE: 5,
} as const;
type PriorityLevel = (typeof PRIORITY)[keyof typeof PRIORITY];

interface ScheduledUpdate {
  fiber: BinaryDOMNode;
  priority: PriorityLevel;
  callback: () => void;
}

// Simple priority queue for scheduled updates
class PriorityQueue {
  private queue: ScheduledUpdate[] = [];
  enqueue(update: ScheduledUpdate) {
    this.queue.push(update);
    this.queue.sort((a, b) => a.priority - b.priority);
  }
  dequeue(): ScheduledUpdate | undefined {
    return this.queue.shift();
  }
  isEmpty() {
    return this.queue.length === 0;
  }
}

export class BinaryDOMRenderer {
  private root: BinaryDOMNode | null = null;
  private container: Element;
  private workInProgress: BinaryDOMNode | null = null;
  private nextUnitOfWork: BinaryDOMNode | null = null;
  private deletions: BinaryDOMNode[] = [];
  private currentRoot: BinaryDOMNode | null = null;
  private delegatedEvents = new Set<string>();
  private pendingUpdates: (() => void)[] = [];
  private scheduled = false;
  private domNodeMap = new WeakMap<HTMLElement, BinaryDOMNode>();
  private updateQueue = new PriorityQueue();
  private currentPriority: PriorityLevel = PRIORITY.NORMAL;
  private batchUpdates: Map<string, any[]> = new Map();
  private pendingNodeUpdates: Set<string> = new Set();
  private pendingFunctionUpdates: (() => void)[] = [];
  private isBatching: boolean = false;
  private eventDelegationMap: Map<string, Set<BinaryDOMNode>> = new Map();
  private eventHandlerCache: Map<string, Function> = new Map();

  constructor(container: Element) {
    this.container = container;
  }

  /**
   * Render a BinaryDOMNode into the container.
   */
  public render(element: BinaryDOMNode): void {
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

  private scheduleWork(callback: IdleRequestCallback): void {
    requestIdleCallback(callback);
  }

  private workLoop(deadline: IdleDeadline): void {
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
    } else if (this.pendingUpdates.length > 0) {
      this.commitBatchedUpdates();
    } else {
      this.scheduled = false;
    }
  }

  private performUnitOfWork(fiber: BinaryDOMNode): BinaryDOMNode | null {
    const isFunctionComponent = typeof fiber.type === "function";

    if (isFunctionComponent) {
      this.updateFunctionComponent(fiber);
    } else {
      this.updateHostComponent(fiber);
    }

    // Return next unit of work
    if (fiber.fiber?.child) {
      return fiber.fiber.child;
    }
    let nextFiber: BinaryDOMNode | null = fiber;
    while (nextFiber) {
      if (nextFiber.fiber?.sibling) {
        return nextFiber.fiber.sibling;
      }
      nextFiber = nextFiber.fiber?.return || null;
    }
    return null;
  }

  private updateFunctionComponent(fiber: BinaryDOMNode): void {
    try {
      const children =
        typeof fiber.type === "function"
          ? [(fiber.type as (props: any) => BinaryDOMNode)(fiber.props)]
          : [];
      this.reconcileChildren(fiber, children);
    } catch (error) {
      // Find the nearest error boundary
      const errorBoundary = ErrorBoundary.findNearestErrorBoundary(fiber);

      if (errorBoundary) {
        // Let the error boundary handle the error
        errorBoundary.handleError(error as Error, {
          componentStack: this.getComponentStack(fiber),
        });

        // Re-render the error boundary with the fallback UI
        const fallbackNode = errorBoundary.render();
        this.reconcileChildren(fiber, [fallbackNode]);
      } else {
        // No error boundary found, mark as error and log
        fiber.effectTag = "ERROR";
        console.error("Uncaught error in function component:", error);
        console.error("Component stack:", this.getComponentStack(fiber));
      }
    }
  }

  private getComponentStack(fiber: BinaryDOMNode | null): string {
    const stack: string[] = [];
    let currentFiber = fiber;

    while (currentFiber) {
      const componentName =
        typeof currentFiber.type === "function"
          ? currentFiber.type.name || "Anonymous"
          : currentFiber.type;
      stack.unshift(componentName);
      currentFiber = currentFiber.fiber?.return || null;
    }

    return stack.join(" > ");
  }

  private updateHostComponent(fiber: BinaryDOMNode): void {
    if (!fiber.dom) {
      fiber.dom = this.createDom(fiber);
    }
    this.reconcileChildren(fiber, fiber.props.children || []);
  }

  private reconcileChildren(
    wipFiber: BinaryDOMNode,
    elements: BinaryDOMNode[]
  ): BinaryDOMNode[] {
    // This is a simplified reconciliation. A full implementation
    // would compare old fibers (wipFiber.alternate?.fiber?.child) with new elements.
    // For now, we just create new fibers for the elements.
    let index = 0;
    let oldFiber = wipFiber.alternate?.fiber?.child || null; // Safely access old fiber child
    let prevSibling: BinaryDOMNode | null = null;
    const newFibers: BinaryDOMNode[] = [];

    const oldFiberMap = new Map<string | number, BinaryDOMNode>();

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
      let newFiber: BinaryDOMNode | null = null;

      // Compare oldFiber to element (simplified diffing)
      const sameType = oldFiber && element && element.type === oldFiber.type;
      const key = element?.key ?? index; // Use element key or index as key
      const matchedOldFiber = oldFiberMap.get(key);

      if (sameType && matchedOldFiber && oldFiber) {
        // Update the old fiber
        newFiber = {
          type:
            typeof oldFiber.type === "string" ? oldFiber.type : oldFiber.type,
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
        } else if (!element) {
          oldFiber = oldFiber.fiber?.sibling || null;
        } else {
          // If oldFiber exists but wasn't matched by key and there's a new element,
          // we don't advance oldFiber here. It will be considered for deletion later
          // if it remains unmatched.
        }
      } else if (matchedOldFiber) {
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
      } else if (newFiber && prevSibling) {
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

  private commitRoot(): void {
    this.deletions.forEach((fiber) => this.commitDeletion(fiber)); // Pass only the fiber
    if (this.workInProgress?.fiber?.child) {
      this.commitWork(this.workInProgress.fiber.child);
    }
    this.currentRoot = this.workInProgress;
    this.workInProgress = null;
    this.commitBatchedUpdates(); // Commit all pending DOM updates after tree traversal
  }

  private commitWork(fiber: BinaryDOMNode | null): void {
    if (!fiber) return;

    let domParentFiber = fiber.fiber?.return;
    while (domParentFiber && !domParentFiber.dom) {
      domParentFiber = domParentFiber.fiber?.return;
    }
    const domParent = domParentFiber?.dom;

    this.scheduleUpdate(() => {
      if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
        (domParent as HTMLElement).appendChild(fiber.dom);
      } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
        if (fiber.alternate) {
          this.updateDom(
            fiber.dom as HTMLElement,
            fiber.alternate.props,
            fiber.props
          );
        }
      } else if (fiber.effectTag === "DELETION") {
        // Deletion handled in commitDeletion
      }
    });

    if (fiber.fiber?.child) this.commitWork(fiber.fiber.child);
    if (fiber.fiber?.sibling) this.commitWork(fiber.fiber.sibling);
  }

  private commitDeletion(
    fiber: BinaryDOMNode,
    domParent?: HTMLElement | Text
  ): void {
    // If domParent is not provided, find it by traversing up the fiber tree
    let actualDomParent = domParent;
    if (!actualDomParent) {
      let domParentFiber = fiber.fiber?.return;
      while (domParentFiber && !domParentFiber.dom) {
        domParentFiber = domParentFiber.fiber?.return;
      }
      actualDomParent = domParentFiber?.dom as HTMLElement | Text | undefined;
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
      } else if (fiber.fiber?.child) {
        // If no DOM, continue deletion down the tree, passing the found domParent
        this.commitDeletion(fiber.fiber.child, actualDomParent);
      }
    });
  }

  private createDom(fiber: BinaryDOMNode): HTMLElement | Text {
    const textContent =
      typeof fiber.props?.text === "string"
        ? fiber.props.text
        : typeof fiber.value === "string"
        ? fiber.value
        : "";
    const dom =
      fiber.type === "text"
        ? document.createTextNode(textContent)
        : document.createElement(fiber.type as string);

    if (dom instanceof HTMLElement) {
      dom.setAttribute("data-binary-id", fiber.id);
      this.updateDom(dom, {}, fiber.props);
      this.domNodeMap.set(dom, fiber);
      
      // Setup event delegation for this node's event handlers
      if (fiber.eventHandlers) {
        for (const eventType of fiber.eventHandlers.keys()) {
          this.setupEventDelegation(eventType);
          this.eventDelegationMap.get(eventType)!.add(fiber);
        }
      }
    }

    return dom;
  }

  private updateDom(
    dom: HTMLElement,
    prevProps: BinaryDOMProps,
    nextProps: BinaryDOMProps
  ): void {
    // Helper to check if a prop is an event listener
    const isEvent = (key: string) => key.startsWith("on");

    // Update Attributes and Properties
    Object.keys(nextProps).forEach((key) => {
      if (key === "children" || isEvent(key)) return; // Handled elsewhere

      const prevValue = prevProps[key];
      const nextValue = nextProps[key];

      if (prevValue !== nextValue) {
        if (key === "style") {
          // Handle style object
          const prevStyle = (prevValue || {}) as {
            [key: string]: string | number | undefined | null;
          };
          const nextStyle = (nextValue || {}) as {
            [key: string]: string | number | undefined | null;
          };
          // Remove old style properties
          Object.keys(prevStyle).forEach((styleKey) => {
            // Check if the style key exists in nextStyle and is not null/undefined
            if (
              !(styleKey in nextStyle) ||
              nextStyle[styleKey] === undefined ||
              nextStyle[styleKey] === null
            ) {
              dom.style.removeProperty(styleKey);
            }
          });
          // Set new or changed style properties
          Object.keys(nextStyle).forEach((styleKey) => {
            const nextStyleValue = nextStyle[styleKey];
            // Only set if the value is a string or number and is different
            if (
              typeof nextStyleValue === "string" ||
              typeof nextStyleValue === "number"
            ) {
              const prevStyleValue = prevStyle[styleKey];
              if (prevStyleValue !== nextStyleValue) {
                dom.style.setProperty(styleKey, String(nextStyleValue));
              }
            } else if (
              nextStyleValue === null ||
              nextStyleValue === undefined
            ) {
              // Ensure null/undefined removes the property even if it was in prevStyle
              dom.style.removeProperty(styleKey);
            }
          });
        } else if (key === "className") {
          // Handle className property
          dom.className = (nextValue as string) || "";
        } else if (key === "value" && dom instanceof HTMLInputElement) {
          // Handle value property for inputs
          dom.value = (nextValue as string) || "";
        } else if (key === "checked" && dom instanceof HTMLInputElement) {
          // Handle checked property for checkboxes
          dom.checked = Boolean(nextValue);
        } else if (nextValue === null || nextValue === undefined) {
          // Remove attribute if null or undefined
          dom.removeAttribute(key);
        } else if (
          typeof nextValue !== "object" &&
          typeof nextValue !== "function"
        ) {
          // Set other simple values as attributes
          dom.setAttribute(key, String(nextValue));
        } else {
          // Handle complex props by setting directly on the DOM object if possible
          try {
            (dom as any)[key] = nextValue;
          } catch {} // Attempt to set property
        }
      }
    });

    // Remove Old Attributes and Properties
    Object.keys(prevProps).forEach((key) => {
      if (key === "children" || isEvent(key)) return; // Handled elsewhere
      // If the key is not in nextProps (or is explicitly undefined/null in nextProps),
      // ensure it's removed from the DOM.
      if (
        !(key in nextProps) ||
        nextProps[key] === undefined ||
        nextProps[key] === null
      ) {
        if (key === "style") {
          // Remove all old style properties if style object is gone or null/undefined
          const prevStyle = (prevProps[key] || {}) as {
            [key: string]: string | number | undefined | null;
          };
          Object.keys(prevStyle).forEach((styleKey) => {
            dom.style.removeProperty(styleKey);
          });
        } else if (key === "className") {
          dom.className = "";
        } else if (key === "value" && dom instanceof HTMLInputElement) {
          dom.value = ""; // Clear value
        } else if (key === "checked" && dom instanceof HTMLInputElement) {
          dom.checked = false; // Uncheck
        } else if (dom.hasAttribute(key)) {
          dom.removeAttribute(key);
        } else {
          // Attempt to clear property if attribute wasn't removed
          try {
            (dom as any)[key] = null;
          } catch {}
        }
      }
    });

    // Event handlers are primarily managed by the delegation system setup in createDom.
    // We need to ensure the fiber's eventHandlers map is up-to-date during reconciliation.
    // The delegation logic then reads from the current fiber via the domNodeMap lookup.
    // So no direct event listener manipulation needed here if delegation is used.
  }

  private setupEventDelegation(eventType: string) {
    if (!this.eventDelegationMap.has(eventType)) {
      this.eventDelegationMap.set(eventType, new Set());
      
      // Create cached event handler
      const handler = this.createDelegatedHandler(eventType);
      this.eventHandlerCache.set(eventType, handler);
      
      // Add event listener to container
      this.container.addEventListener(eventType as keyof ElementEventMap, handler as EventListener, {
        capture: true,
        passive: true
      });
    }
  }

  private createDelegatedHandler(eventType: string): Function {
    return (event: Event) => {
      const path = event.composedPath();
      const target = event.target as HTMLElement;
      
      // Find the closest BinaryDOMNode
      let currentElement = target;
      while (currentElement && currentElement !== this.container) {
        const binaryId = currentElement.getAttribute('data-binary-id');
        if (binaryId) {
          const node = this.findNodeById(binaryId, this.root);
          if (node) {
            // Check if node has handler for this event
            const handler = node.eventHandlers.get(eventType.toLowerCase());
            if (handler) {
              // Create synthetic event
              const syntheticEvent = this.createSyntheticEvent(event, node);
              
              // Call handler with synthetic event
              handler(syntheticEvent);
              
              // Stop propagation if event was handled
              if (syntheticEvent.isPropagationStopped) {
                event.stopPropagation();
              }
              
              // Prevent default if event was handled
              if (syntheticEvent.isDefaultPrevented) {
                event.preventDefault();
              }
              
              break;
            }
          }
        }
        currentElement = currentElement.parentElement!;
      }
    };
  }

  private createSyntheticEvent(nativeEvent: Event, node: BinaryDOMNode): any {
    const syntheticEvent = {
      nativeEvent,
      target: nativeEvent.target,
      currentTarget: node,
      preventDefault() {
        this.isDefaultPrevented = true;
      },
      stopPropagation() {
        this.isPropagationStopped = true;
      },
      isDefaultPrevented: false,
      isPropagationStopped: false,
    };
    
    // Copy known event properties
    const knownProps = ['type', 'bubbles', 'cancelable', 'timeStamp', 'defaultPrevented', 'eventPhase'];
    for (const prop of knownProps) {
      if (prop in nativeEvent) {
        (syntheticEvent as any)[prop] = (nativeEvent as any)[prop];
      }
    }
    
    return syntheticEvent;
  }

  private cleanupEventDelegation() {
    // Remove all event listeners
    for (const [eventType, handler] of this.eventHandlerCache) {
      this.container.removeEventListener(eventType as keyof ElementEventMap, handler as EventListener, {
        capture: true
      });
    }
    
    this.eventDelegationMap.clear();
    this.eventHandlerCache.clear();
  }

  private findNodeById(
    id: string,
    node: BinaryDOMNode | null
  ): BinaryDOMNode | null {
    if (!node || !id) return null;
    // Fallback lookup, prefer WeakMap
    if (node.id === id) return node;
    // Simple depth-first search - could be optimized with a map during build
    if (node.fiber?.child) {
      const found = this.findNodeById(id, node.fiber.child);
      if (found) return found;
    }
    if (node.fiber?.sibling) {
      const found = this.findNodeById(id, node.fiber.sibling);
      if (found) return found;
    }
    return null;
  }

  private scheduleUpdate(fn: () => void) {
    this.pendingFunctionUpdates.push(fn);
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => {
        this.commitBatchedUpdates();
      });
    }
  }

  private commitBatchedUpdates() {
    this.pendingFunctionUpdates.forEach((f) => f());
    this.pendingFunctionUpdates = [];
    this.scheduled = false;
    // After committing DOM updates, check if there is still work to do
    if (this.nextUnitOfWork) {
      this.scheduleWork(this.workLoop.bind(this));
    }
  }

  // Helper to create a complete fiber object with all required properties
  private createFiber(
    props: Partial<NonNullable<BinaryDOMNode["fiber"]>>
  ): NonNullable<BinaryDOMNode["fiber"]> {
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
  public scheduleUpdateWithPriority(
    fiber: BinaryDOMNode,
    priority: PriorityLevel,
    callback: () => void
  ) {
    this.updateQueue.enqueue({ fiber, priority, callback });
    if (!this.scheduled) {
      this.scheduled = true;
      this.scheduleWork(this.workLoop.bind(this));
    }
  }

  public createElement(node: BinaryDOMNode): HTMLElement {
    const element = document.createElement(node.type as string);
    element.setAttribute('data-binary-id', node.id);
    
    // Set attributes
    node.attributes.forEach((value, key) => {
      element.setAttribute(key, value);
    });
    
    return element;
  }

  private scheduleNodeUpdate(nodeId: string, update: any) {
    if (!this.batchUpdates.has(nodeId)) {
      this.batchUpdates.set(nodeId, []);
    }
    this.batchUpdates.get(nodeId)!.push(update);
    this.pendingNodeUpdates.add(nodeId);
    
    if (!this.isBatching) {
      this.isBatching = true;
      requestAnimationFrame(() => this.flushUpdates());
    }
  }

  private flushUpdates() {
    this.isBatching = false;
    
    // Process updates in order of dependency
    const sortedUpdates = this.sortUpdatesByDependency();
    
    for (const nodeId of sortedUpdates) {
      const updates = this.batchUpdates.get(nodeId) || [];
      for (const update of updates) {
        this.applyChange(update);
      }
    }
    
    this.batchUpdates.clear();
    this.pendingNodeUpdates.clear();
  }

  private sortUpdatesByDependency(): string[] {
    const visited = new Set<string>();
    const sorted: string[] = [];
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = this.findNodeById(nodeId, this.root);
      if (node?.left) visit(node.left.id);
      if (node?.right) visit(node.right.id);
      
      sorted.push(nodeId);
    };
    
    for (const nodeId of this.pendingNodeUpdates) {
      visit(nodeId);
    }
    
    return sorted;
  }

  private applyChange(update: any) {
    const node = this.findNodeById(update.node.id, this.root);
    if (!node || !node.dom) return;

    switch (update.type) {
      case 'UPDATE_ATTRIBUTE':
        if (update.value === null) {
          (node.dom as HTMLElement).removeAttribute(update.attribute);
        } else {
          (node.dom as HTMLElement).setAttribute(update.attribute, update.value);
        }
        break;
      case 'INSERT_NODE':
        if (update.parent.dom) {
          update.parent.dom.appendChild(update.node.dom);
        }
        break;
      case 'REMOVE_NODE':
        if (update.node.dom && update.node.dom.parentNode) {
          update.node.dom.parentNode.removeChild(update.node.dom);
        }
        break;
    }
  }

  private diff(oldTree: BinaryDOMNode, newTree: BinaryDOMNode): any[] {
    const changes: any[] = [];
    
    // Fast path: If checksums match, no changes needed
    if (oldTree.checksum === newTree.checksum) {
      return changes;
    }
    
    // Compare attributes with optimized iteration
    if (oldTree.type === "element" && newTree.type === "element") {
      const oldAttrs = oldTree.attributes;
      const newAttrs = newTree.attributes;
      
      // Check for removed or changed attributes
      for (const [key, value] of oldAttrs) {
        if (!newAttrs.has(key) || newAttrs.get(key) !== value) {
          changes.push({
            type: "UPDATE_ATTRIBUTE",
            node: oldTree,
            attribute: key,
            value: newAttrs.get(key) || null,
          });
        }
      }
      
      // Check for new attributes
      for (const [key, value] of newAttrs) {
        if (!oldAttrs.has(key)) {
          changes.push({
            type: "UPDATE_ATTRIBUTE",
            node: oldTree,
            attribute: key,
            value,
          });
        }
      }
    }
    
    // Compare children with binary tree optimization
    if (oldTree.left && newTree.left) {
      changes.push(...this.diff(oldTree.left, newTree.left));
    } else if (newTree.left) {
      changes.push({
        type: "INSERT_NODE",
        parent: oldTree,
        node: newTree.left,
      });
    } else if (oldTree.left) {
      changes.push({
        type: "REMOVE_NODE",
        node: oldTree.left,
      });
    }
    
    if (oldTree.right && newTree.right) {
      changes.push(...this.diff(oldTree.right, newTree.right));
    } else if (newTree.right) {
      changes.push({
        type: "INSERT_NODE",
        parent: oldTree,
        node: newTree.right,
      });
    } else if (oldTree.right) {
      changes.push({
        type: "REMOVE_NODE",
        node: oldTree.right,
      });
    }
    
    return changes;
  }
}

function isFunctionComponent(
  node: BinaryDOMNode
): node is BinaryDOMNode & { type: (props: any) => BinaryDOMNode } {
  return typeof node.type === "function";
}
