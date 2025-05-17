import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child
 * component tree and display a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-col items-center space-y-4 my-8 text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            Something went wrong
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            The application encountered an error. Please try refreshing the
            page.
          </p>
          {this.state.error && (
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded w-full overflow-auto text-left">
              <p className="text-sm font-mono text-gray-800 dark:text-gray-200">
                {this.state.error.toString()}
              </p>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Refresh page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
