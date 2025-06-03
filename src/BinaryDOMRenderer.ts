import { BinaryDOMNode, BinaryDOMProps } from "./types/BinaryDOMNode";

export class BinaryDOMRenderer {
  private root: BinaryDOMNode | null = null;
  private container: Element;
  private workInProgress: BinaryDOMNode | null = null;
  private nextUnitOfWork: BinaryDOMNode | null = null;
  private deletions: BinaryDOMNode[] = [];
  private currentRoot: BinaryDOMNode | null = null;
  private delegatedEvents = new Set<string>();

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
    };
    this.nextUnitOfWork = this.workInProgress;
    this.deletions = [];
    requestIdleCallback(this.workLoop.bind(this));
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

    requestIdleCallback(this.workLoop.bind(this));
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

    while (index < elements.length || oldFiber) {
      const element = elements[index];
      let newFiber: BinaryDOMNode | null = null;

      const sameType = oldFiber && element && element.type === oldFiber.type;

      if (sameType && oldFiber) {
        newFiber = {
          ...oldFiber,
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          alternate: oldFiber,
          effectTag: "UPDATE",
        };
      }
      if (element && !sameType) {
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
      if (oldFiber && !sameType) {
        oldFiber.effectTag = "DELETION";
        this.deletions.push(oldFiber);
      }

      if (oldFiber) {
        oldFiber = oldFiber.sibling;
      }

      if (index === 0) {
        wipFiber.child = newFiber;
      } else if (element) {
        if (prevSibling) prevSibling.sibling = newFiber;
      }

      prevSibling = newFiber;
      index++;
    }
  }

  private commitRoot(): void {
    this.deletions.forEach(this.commitDeletion.bind(this));
    this.commitWork(this.workInProgress!.child!);
    this.currentRoot = this.workInProgress;
    this.workInProgress = null;
  }

  private commitWork(fiber: BinaryDOMNode): void {
    if (!fiber) return;

    let domParentFiber = fiber.parent;
    while (domParentFiber && !domParentFiber.dom) {
      domParentFiber = domParentFiber.parent!;
    }
    if (!domParentFiber) return;
    const domParent = domParentFiber.dom;

    if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
      (domParent as HTMLElement).appendChild(fiber.dom);
    } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
      if (fiber.dom instanceof HTMLElement) {
        this.updateDom(fiber.dom, fiber.alternate!.props, fiber.props);
      }
    } else if (fiber.effectTag === "DELETION") {
      this.commitDeletion(fiber);
    }

    if (fiber.child) this.commitWork(fiber.child);
    if (fiber.sibling) this.commitWork(fiber.sibling);
  }

  private commitDeletion(fiber: BinaryDOMNode): void {
    if (fiber.dom) {
      let domParentFiber = fiber.parent;
      while (domParentFiber && !domParentFiber.dom) {
        domParentFiber = domParentFiber.parent!;
      }
      if (!domParentFiber) return;
      const domParent = domParentFiber.dom;
      (domParent as HTMLElement).removeChild(fiber.dom);
    } else if (fiber.child) {
      this.commitDeletion(fiber.child);
    }
  }

  private createDom(fiber: BinaryDOMNode): HTMLElement | Text {
    const dom =
      fiber.type === "text"
        ? document.createTextNode(
            typeof fiber.props?.text === "string"
              ? fiber.props.text
              : typeof fiber.value === "string"
              ? fiber.value
              : ""
          )
        : document.createElement(fiber.type as string);

    if (dom instanceof HTMLElement) {
      this.updateDom(dom, {}, fiber.props);
    }
    return dom;
  }

  private updateDom(
    dom: HTMLElement,
    prevProps: BinaryDOMProps,
    nextProps: BinaryDOMProps
  ): void {
    // Remove old properties
    Object.keys(prevProps).forEach((key) => {
      if (key !== "children" && !(key in nextProps)) {
        if (key.startsWith("on")) {
          const eventType = key.toLowerCase().substring(2);
          dom.removeEventListener(eventType, prevProps[key] as EventListener);
        } else {
          (dom as any)[key] = "";
        }
      }
    });

    // Set new or changed properties
    Object.keys(nextProps).forEach((key) => {
      if (key !== "children" && prevProps[key] !== nextProps[key]) {
        if (key.startsWith("on")) {
          const eventType = key.toLowerCase().substring(2);
          if (prevProps[key]) {
            dom.removeEventListener(eventType, prevProps[key] as EventListener);
          }
          dom.addEventListener(eventType, nextProps[key] as EventListener);
        } else {
          (dom as any)[key] = nextProps[key];
        }
      }
    });
  }

  public createElement(node: any): HTMLElement | Text {
    if (node.type === "text") {
      return document.createTextNode(node.props?.text || node.value || "");
    }
    const el = document.createElement(node.tagName || "div");
    // Set attributes
    if (node.attributes) {
      node.attributes.forEach((value: string, key: string) =>
        el.setAttribute(key, value)
      );
    }
    // Set props
    if (node.props) {
      Object.entries(node.props).forEach(([key, value]) => {
        if (key !== "children" && typeof value !== "function") {
          try {
            (el as any)[key] = value;
          } catch {}
        }
      });
    }
    // Append children
    if (node.children) {
      node.children.forEach((child: any) => {
        el.appendChild(this.createElement(child) as Node);
      });
    }
    return el;
  }

  private setupEventDelegation(eventType: string) {
    if (this.delegatedEvents.has(eventType)) return;
    this.delegatedEvents.add(eventType);

    this.container.addEventListener(eventType, (event: Event) => {
      let target = event.target as HTMLElement | null;
      while (target && target !== this.container) {
        const binaryId = target.getAttribute("data-binary-id");
        if (binaryId) {
          const node = this.findNodeById(binaryId, this.currentRoot);
          if (node && node.eventHandlers.has(eventType)) {
            node.eventHandlers.get(eventType)!(event);
            break;
          }
        }
        target = target.parentElement;
      }
    });
  }

  private findNodeById(
    id: string,
    node: BinaryDOMNode | null
  ): BinaryDOMNode | null {
    if (!node) return null;
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = this.findNodeById(id, child);
      if (found) return found;
    }
    return null;
  }
}

function isFunctionComponent(
  node: BinaryDOMNode
): node is BinaryDOMNode & { type: (props: any) => BinaryDOMNode } {
  return typeof node.type === "function";
}
