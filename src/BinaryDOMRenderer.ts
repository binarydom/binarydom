import { BinaryDOMNode, BinaryDOMProps } from "./types/BinaryDOMNode";

export class BinaryDOMRenderer {
  private root: BinaryDOMNode | null = null;
  private container: Element;
  private workInProgress: BinaryDOMNode | null = null;
  private nextUnitOfWork: BinaryDOMNode | null = null;
  private deletions: BinaryDOMNode[] = [];
  private currentRoot: BinaryDOMNode | null = null;

  constructor(container: Element) {
    this.container = container;
  }

  public render(element: BinaryDOMNode) {
    this.workInProgress = {
      ...element,
      alternate: this.currentRoot,
    };
    this.nextUnitOfWork = this.workInProgress;
    this.deletions = [];
    requestIdleCallback(this.workLoop.bind(this));
  }

  private workLoop(deadline: IdleDeadline) {
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

  private updateFunctionComponent(fiber: BinaryDOMNode) {
    const children = [fiber.type(fiber.props)];
    this.reconcileChildren(fiber, children);
  }

  private updateHostComponent(fiber: BinaryDOMNode) {
    if (!fiber.dom) {
      fiber.dom = this.createDom(fiber);
    }
    this.reconcileChildren(fiber, fiber.props.children);
  }

  private reconcileChildren(
    wipFiber: BinaryDOMNode,
    elements: BinaryDOMNode[]
  ) {
    let index = 0;
    let oldFiber = wipFiber.alternate?.child;
    let prevSibling: BinaryDOMNode | null = null;

    while (index < elements.length || oldFiber) {
      const element = elements[index];
      let newFiber: BinaryDOMNode | null = null;

      const sameType = oldFiber && element && element.type === oldFiber.type;

      if (sameType) {
        newFiber = {
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
        prevSibling!.sibling = newFiber;
      }

      prevSibling = newFiber;
      index++;
    }
  }

  private commitRoot() {
    this.deletions.forEach(this.commitDeletion.bind(this));
    this.commitWork(this.workInProgress!.child!);
    this.currentRoot = this.workInProgress;
    this.workInProgress = null;
  }

  private commitWork(fiber: BinaryDOMNode) {
    if (!fiber) return;

    let domParentFiber = fiber.parent;
    while (!domParentFiber.dom) {
      domParentFiber = domParentFiber.parent!;
    }
    const domParent = domParentFiber.dom;

    if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
      domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
      this.updateDom(fiber.dom, fiber.alternate!.props, fiber.props);
    } else if (fiber.effectTag === "DELETION") {
      this.commitDeletion(fiber);
    }

    this.commitWork(fiber.child!);
    this.commitWork(fiber.sibling!);
  }

  private commitDeletion(fiber: BinaryDOMNode) {
    if (fiber.dom) {
      let domParentFiber = fiber.parent;
      while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent!;
      }
      const domParent = domParentFiber.dom;
      domParent.removeChild(fiber.dom);
    } else {
      this.commitDeletion(fiber.child!);
    }
  }

  private createDom(fiber: BinaryDOMNode): HTMLElement {
    const dom =
      fiber.type === "text"
        ? document.createTextNode("")
        : document.createElement(fiber.type as string);

    this.updateDom(dom, {}, fiber.props);
    return dom;
  }

  private updateDom(
    dom: HTMLElement,
    prevProps: BinaryDOMProps,
    nextProps: BinaryDOMProps
  ) {
    // Remove old properties
    Object.keys(prevProps).forEach((key) => {
      if (key !== "children" && !(key in nextProps)) {
        if (key.startsWith("on")) {
          const eventType = key.toLowerCase().substring(2);
          dom.removeEventListener(eventType, prevProps[key]);
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
            dom.removeEventListener(eventType, prevProps[key]);
          }
          dom.addEventListener(eventType, nextProps[key]);
        } else {
          (dom as any)[key] = nextProps[key];
        }
      }
    });
  }
}
