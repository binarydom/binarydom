import { BinaryDOMNode } from "../types/BinaryDOMNode";
import { BinaryDOMComponent } from "../BinaryDOMComponent";

interface SuspenseProps {
  fallback: BinaryDOMNode;
  children: BinaryDOMNode;
}

interface SuspenseState {
  isLoading: boolean;
  error: Error | null;
}

export class Suspense extends BinaryDOMComponent<SuspenseProps, SuspenseState> {
  constructor(props: SuspenseProps) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
    };
  }

  async componentDidMount() {
    try {
      this.setState({ isLoading: true });
      await this.loadChildren();
      this.setState({ isLoading: false });
    } catch (error) {
      this.setState({
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  private async loadChildren() {
    const loadPromises: Promise<any>[] = [];

    const traverse = (node: BinaryDOMNode) => {
      if (node.type === "element" && typeof node.props.load === "function") {
        loadPromises.push(node.props.load());
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(this.props.children);
    await Promise.all(loadPromises);
  }

  render(): BinaryDOMNode {
    if (this.state.error) {
      return createNode("div", { className: "error" }, [
        {
          id: Math.random().toString(36).substring(2, 11),
          type: "text",
          props: { text: this.state.error.message },
          attributes: new Map(),
          children: [],
          left: null,
          right: null,
          parent: null,
          checksum: 0,
          isDirty: false,
          eventHandlers: new Map(),
          state: null,
          hooks: [],
        },
      ]);
    }

    if (this.state.isLoading) {
      return this.props.fallback;
    }

    return this.props.children;
  }

  update(newElement: BinaryDOMNode): void {
    if (typeof newElement.type === "function" && newElement.props) {
      const props = newElement.props as unknown as SuspenseProps;
      if ('fallback' in props && 'children' in props) {
        this.props = props;
        this.setState({ isLoading: true });
        this.loadChildren().then(() => {
          this.setState({ isLoading: false });
        }).catch(error => {
          this.setState({
            isLoading: false,
            error: error instanceof Error ? error : new Error(String(error))
          });
        });
      }
    }
  }
}

export function lazy(loader: () => Promise<any>) {
  let Component: any = null;
  let loadingPromise: Promise<any> | null = null;

  return {
    type: "function",
    props: {
      load: async () => {
        if (!loadingPromise) {
          loadingPromise = loader().then((module) => {
            Component = module.default;
          });
        }
        await loadingPromise;
      },
      render: (props: any) => {
        if (!Component) {
          throw loadingPromise;
        }
        return {
          type: "function",
          props: { ...props },
          children: [Component],
        };
      },
    },
  };
}

function createNode(
  type: string,
  props: any,
  children: BinaryDOMNode[]
): BinaryDOMNode {
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: "element",
    props,
    attributes: new Map(),
    children,
    left: null,
    right: null,
    parent: null,
    checksum: 0,
    isDirty: false,
    eventHandlers: new Map(),
    state: null,
    hooks: [],
  };
}
