import { BinaryDOMNode, BinaryDOMProps } from "../types/BinaryDOMNode";
interface ErrorBoundaryProps extends BinaryDOMProps {
    fallback: (error: Error) => BinaryDOMNode;
    onError?: (error: Error, errorInfo: {
        componentStack: string;
    }) => void;
}
export declare class ErrorBoundary {
    private props;
    private state;
    private static errorBoundaries;
    constructor(props: ErrorBoundaryProps);
    static getErrorBoundary(fiber: BinaryDOMNode): ErrorBoundary | undefined;
    static registerErrorBoundary(fiber: BinaryDOMNode, boundary: ErrorBoundary): void;
    static unregisterErrorBoundary(fiber: BinaryDOMNode): void;
    static findNearestErrorBoundary(fiber: BinaryDOMNode | null): ErrorBoundary | null;
    handleError(error: Error, errorInfo: {
        componentStack: string;
    }): void;
    render(): BinaryDOMNode;
    reset(): void;
}
export declare function createErrorBoundary(props: ErrorBoundaryProps, children: BinaryDOMNode): BinaryDOMNode;
export {};
