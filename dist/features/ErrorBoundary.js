"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = void 0;
exports.withErrorBoundary = withErrorBoundary;
const BinaryDOMComponent_1 = require("../BinaryDOMComponent");
class ErrorBoundary extends BinaryDOMComponent_1.BinaryDOMComponent {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
        };
    }
    componentDidCatch(error, errorInfo) {
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback(this.state.error);
        }
        return this.props.children;
    }
}
exports.ErrorBoundary = ErrorBoundary;
function withErrorBoundary(Component, fallback, onError) {
    return (props) => ({
        type: "function",
        props: {
            render: () => ({
                type: "function",
                props: {
                    fallback,
                    onError,
                    children: [
                        {
                            type: "function",
                            props: { ...props },
                            children: [Component],
                        },
                    ],
                },
                children: [ErrorBoundary],
            }),
        },
    });
}
