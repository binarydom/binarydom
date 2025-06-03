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

export class ErrorBoundary extends BinaryDOMComponent<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error!);
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  Component: any,
  fallback: (error: Error) => BinaryDOMNode,
  onError?: (error: Error, errorInfo: any) => void
) {
  return (props: P) => ({
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
