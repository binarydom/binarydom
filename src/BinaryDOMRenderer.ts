import { BinaryDOMNode, BinaryDOMProps } from "./types/BinaryDOMNode";

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
    while (this.nextUnitOfWork && !shouldYield) {
      this.nextUnitOfWork = this.performUnitOfWork(this.nextUnitOfWork);
      shouldYield = deadline.timeRemaining() < 1;
    }

    if (!this.nextUnitOfWork && this.workInProgress) {
      this.commitRoot();
    }

    // Only schedule the next work loop if there is still work to do
    if (this.nextUnitOfWork) {
      this.scheduleWork(this.workLoop.bind(this));
    } else if (this.pendingUpdates.length > 0) {
      // If work is done but pending updates exist, commit them
      this.commitBatchedUpdates();
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
    if (fiber.child) {
      return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling;
      }
      nextFiber = nextFiber.return!;
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
      // Optionally, mark this fiber as errored or render a fallback
      fiber.effectTag = "ERROR";
      // You could also dispatch a global error event or call a callback here
      // For now, just log:
      console.error("Error in function component:", error);
    }
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
  ): void {
    let index = 0;
    let oldFiber = wipFiber.alternate?.child;
    let prevSibling: BinaryDOMNode | null = null;

    // Create a map of old fibers by key for faster lookup
    const oldFiberMap = new Map<string | number, BinaryDOMNode>();
    while (oldFiber) {
      oldFiberMap.set(oldFiber.key || index, oldFiber);
      oldFiber = oldFiber.sibling;
      index++; // Use index as a fallback key if key is missing
    }
    index = 0; // Reset index for new elements

    oldFiber = wipFiber.alternate?.child; // Reset oldFiber to the start

    while (index < elements.length || oldFiber) {
      const element = elements[index];
      let newFiber: BinaryDOMNode | null = null;

      // Attempt to find a matching old fiber by key, then by type
      const key = element?.key || index;
      const matchedOldFiber = oldFiberMap.get(key);

      const sameType =
        matchedOldFiber && element && element.type === matchedOldFiber.type;

      if (sameType) {
        // Found a match, reuse the old fiber's DOM
        newFiber = {
          ...matchedOldFiber,
          type: matchedOldFiber.type,
          props: element.props,
          dom: matchedOldFiber.dom,
          parent: wipFiber,
          alternate: matchedOldFiber,
          effectTag: "UPDATE",
        };
        oldFiberMap.delete(key); // Remove from map as it's been matched
      } else if (element) {
        // No match or different type, create a new fiber
        newFiber = {
          ...element,
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          effectTag: "PLACEMENT",
        };
      }

      // If there's an unmatched old fiber at the current index, mark it for deletion
      if (oldFiber && (!matchedOldFiber || !sameType)) {
        oldFiber.effectTag = "DELETION";
        this.deletions.push(oldFiber);
      }

      if (index === 0) {
        wipFiber.child = newFiber;
      } else if (newFiber) {
        // Use newFiber here as prevSibling should point to it
        if (prevSibling) prevSibling.sibling = newFiber;
      }

      prevSibling = newFiber;
      index++;

      // Move to the next old fiber if we didn't match the current one
      if (oldFiber && (!matchedOldFiber || !sameType)) {
        oldFiber = oldFiber.sibling; // only advance oldFiber if it wasn't matched by key
      } else if (oldFiber && matchedOldFiber && sameType) {
        oldFiber = oldFiber.sibling; // Also advance oldFiber if it was matched to keep pace with index
      }
      // Note: If oldFiber was null, we just proceed with new elements
    }

    // Any remaining old fibers in the map were not matched and should be deleted
    oldFiberMap.forEach((fiberToDel) => {
      fiberToDel.effectTag = "DELETION";
      this.deletions.push(fiberToDel);
    });
  }

  private commitRoot(): void {
    this.deletions.forEach(this.commitDeletion.bind(this));
    if (this.workInProgress?.child) {
      this.commitWork(this.workInProgress.child);
    }
    this.currentRoot = this.workInProgress;
    this.workInProgress = null;
    this.commitBatchedUpdates(); // Commit all pending DOM updates after tree traversal
  }

  private commitWork(fiber: BinaryDOMNode): void {
    if (!fiber) return;

    let domParentFiber = fiber.parent;
    while (domParentFiber && !domParentFiber.dom) {
      domParentFiber = domParentFiber.parent!;
    }
    if (!domParentFiber?.dom) return; // Check domParentFiber and its dom
    const domParent = domParentFiber.dom;

    this.scheduleUpdate(() => {
      if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
        (domParent as HTMLElement).appendChild(fiber.dom);
      } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
        if (fiber.dom instanceof HTMLElement) {
          this.updateDom(fiber.dom, fiber.alternate!.props, fiber.props);
        }
      } else if (fiber.effectTag === "DELETION") {
        // Deletion handled in commitDeletion
      }
    });

    if (fiber.child) this.commitWork(fiber.child);
    if (fiber.sibling) this.commitWork(fiber.sibling);
  }

  private commitDeletion(fiber: BinaryDOMNode): void {
    this.scheduleUpdate(() => {
      if (fiber.dom) {
        let domParentFiber = fiber.parent;
        while (domParentFiber && !domParentFiber.dom) {
          domParentFiber = domParentFiber.parent!;
        }
        if (!domParentFiber?.dom) return; // Check domParentFiber and its dom
        const domParent = domParentFiber.dom;
        (domParent as HTMLElement).removeChild(fiber.dom);
      } else if (fiber.child) {
        // If no DOM, continue deletion down the tree
        this.commitDeletion(fiber.child);
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
    }

    // Setup event delegation for this node's event handlers
    if (dom instanceof HTMLElement && fiber.eventHandlers) {
      fiber.eventHandlers.forEach((handler, eventType) => {
        this.setupEventDelegation(eventType);
      });
    }

    return dom;
  }

  private updateDom(
    dom: HTMLElement,
    prevProps: BinaryDOMProps,
    nextProps: BinaryDOMProps
  ): void {
    // Remove old properties (excluding children and event handlers)
    Object.keys(prevProps).forEach((key) => {
      if (key !== "children" && !key.startsWith("on") && !(key in nextProps)) {
        // For simplicity, just remove attribute if it exists. More complex props need specific handling.
        if (dom.hasAttribute(key)) {
          dom.removeAttribute(key);
        }
        try {
          (dom as any)[key] = null;
        } catch {} // Attempt to clear property
      }
    });

    // Set new or changed properties (excluding children and event handlers)
    Object.keys(nextProps).forEach((key) => {
      if (
        key !== "children" &&
        !key.startsWith("on") &&
        prevProps[key] !== nextProps[key]
      ) {
        // For simplicity, set as attribute if it's not a well-known property that needs special handling.
        // A more robust implementation would handle style, className, etc. specifically.
        if (
          typeof nextProps[key] === "string" ||
          typeof nextProps[key] === "number"
        ) {
          dom.setAttribute(key, String(nextProps[key]));
        } else if (nextProps[key] === null || nextProps[key] === undefined) {
          dom.removeAttribute(key);
        } else {
          // Attempt to set as property for complex types
          try {
            (dom as any)[key] = nextProps[key];
          } catch {}
        }
      }
    });

    // Event handlers are managed by the delegation system, no direct listeners here
  }

  private setupEventDelegation(eventType: string) {
    if (this.delegatedEvents.has(eventType)) return;
    this.delegatedEvents.add(eventType);

    this.container.addEventListener(eventType, (event: Event) => {
      let target = event.target as HTMLElement | null;
      while (target && target !== this.container) {
        // Use WeakMap for faster lookup if possible, fallback to data attribute
        const node =
          this.domNodeMap.get(target) ||
          this.findNodeById(
            target.getAttribute("data-binary-id") || "",
            this.currentRoot
          );

        if (node && node.eventHandlers.has(eventType)) {
          node.eventHandlers.get(eventType)!(event);
          // Stop propagation if handler returns false or explicitly calls stopPropagation
          if ((event as any).isPropagationStopped) break; // Custom flag for stopPropagation
          if ((event as any)._binarydom_stopPropagation) break; // Another custom flag example
        }
        target = target.parentElement;
      }
    });
  }

  private findNodeById(
    id: string,
    node: BinaryDOMNode | null
  ): BinaryDOMNode | null {
    if (!node || !id) return null;
    // Fallback lookup, prefer WeakMap
    if (node.id === id) return node;
    // Simple depth-first search - could be optimized with a map during build
    if (node.child) {
      const found = this.findNodeById(id, node.child);
      if (found) return found;
    }
    if (node.sibling) {
      const found = this.findNodeById(id, node.sibling);
      if (found) return found;
    }
    return null;
  }

  private scheduleUpdate(fn: () => void) {
    this.pendingUpdates.push(fn);
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => {
        this.commitBatchedUpdates();
      });
    }
  }

  private commitBatchedUpdates() {
    this.pendingUpdates.forEach((f) => f());
    this.pendingUpdates = [];
    this.scheduled = false;
    // After committing DOM updates, check if there is still work to do
    if (this.nextUnitOfWork) {
      this.scheduleWork(this.workLoop.bind(this));
    }
  }
}

function isFunctionComponent(
  node: BinaryDOMNode
): node is BinaryDOMNode & { type: (props: any) => BinaryDOMNode } {
  return typeof node.type === "function";
}
