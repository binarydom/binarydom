import { BinaryDOMNode } from "../types/BinaryDOMNode";
import { BinaryDOMComponent } from "../BinaryDOMComponent";
interface ErrorBoundaryProps {
    fallback: (error: Error) => BinaryDOMNode;
    children: BinaryDOMNode;
    onError?: (error: Error, errorInfo: any) => void;
}
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}
export declare class ErrorBoundary extends BinaryDOMComponent<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): ErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: any): void;
    render(): BinaryDOMNode;
}
export declare function withErrorBoundary<P extends object>(Component: any, fallback: (error: Error) => BinaryDOMNode, onError?: (error: Error, errorInfo: any) => void): (props: P) => {
    type: string;
    props: {
        render: () => {
            type: string;
            props: {
                fallback: (error: Error) => BinaryDOMNode;
                onError: ((error: Error, errorInfo: any) => void) | undefined;
                children: {
                    type: string;
                    props: P;
                    children: any[];
                }[];
            };
            children: (typeof ErrorBoundary)[];
        };
    };
};
export {};
