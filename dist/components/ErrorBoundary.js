"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = void 0;
exports.createErrorBoundary = createErrorBoundary;
class ErrorBoundary {
    constructor(props) {
        this.props = props;
        this.state = {
            hasError: false,
            error: null,
        };
    }
    static getErrorBoundary(fiber) {
        return this.errorBoundaries.get(fiber);
    }
    static registerErrorBoundary(fiber, boundary) {
        this.errorBoundaries.set(fiber, boundary);
    }
    static unregisterErrorBoundary(fiber) {
        this.errorBoundaries.delete(fiber);
    }
    static findNearestErrorBoundary(fiber) {
        let currentFiber = fiber;
        while (currentFiber) {
            const boundary = this.getErrorBoundary(currentFiber);
            if (boundary) {
                return boundary;
            }
            currentFiber = currentFiber.fiber?.return || null;
        }
        return null;
    }
    handleError(error, errorInfo) {
        this.state = {
            hasError: true,
            error,
        };
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }
    render() {
        if (this.state.hasError && this.state.error) {
            return this.props.fallback(this.state.error);
        }
        // Return children if no error
        const children = this.props.children;
        if (!children) {
            // Return an empty div if no children
            return {
                type: "div",
                props: {},
                id: Math.random().toString(36).substring(7),
                attributes: new Map(),
                children: [],
                left: null,
                right: null,
                checksum: "",
                isDirty: false,
                value: "",
                key: undefined,
                ref: undefined,
                eventHandlers: new Map(),
                state: null,
                hooks: [],
                fiber: {
                    alternate: null,
                    child: null,
                    sibling: null,
                    return: null,
                    pendingProps: {},
                    memoizedProps: {},
                    memoizedState: undefined,
                    updateQueue: null,
                    flags: 0,
                },
            };
        }
        if (Array.isArray(children)) {
            return children[0];
        }
        return children;
    }
    reset() {
        this.state = {
            hasError: false,
            error: null,
        };
    }
}
exports.ErrorBoundary = ErrorBoundary;
ErrorBoundary.errorBoundaries = new WeakMap();
// Helper function to create an error boundary node
function createErrorBoundary(props, children) {
    const boundary = new ErrorBoundary(props);
    const node = {
        type: "div",
        props: {
            ...props,
            children: [children],
        },
        id: Math.random().toString(36).substring(7),
        attributes: new Map(),
        children: [children],
        left: null,
        right: null,
        checksum: "",
        isDirty: false,
        value: "",
        key: props.key,
        ref: props.ref,
        eventHandlers: new Map(),
        state: null,
        hooks: [],
        fiber: {
            alternate: null,
            child: null,
            sibling: null,
            return: null,
            pendingProps: props,
            memoizedProps: {},
            memoizedState: undefined,
            updateQueue: null,
            flags: 0,
        },
    };
    // Register the error boundary
    ErrorBoundary.registerErrorBoundary(node, boundary);
    return node;
}
