"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Suspense = void 0;
exports.lazy = lazy;
const BinaryDOMComponent_1 = require("../BinaryDOMComponent");
class Suspense extends BinaryDOMComponent_1.BinaryDOMComponent {
    constructor(props) {
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
        }
        catch (error) {
            this.setState({
                isLoading: false,
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }
    }
    async loadChildren() {
        const loadPromises = [];
        const traverse = (node) => {
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
    render() {
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
    update(newElement) {
        if (typeof newElement.type === "function" && newElement.props) {
            const props = newElement.props;
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
exports.Suspense = Suspense;
function lazy(loader) {
    let Component = null;
    let loadingPromise = null;
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
            render: (props) => {
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
function createNode(type, props, children) {
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
