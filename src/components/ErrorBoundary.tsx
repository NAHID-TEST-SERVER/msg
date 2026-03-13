import * as React from "react";
import { ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props extends React.PropsWithChildren<{}> {}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Something went wrong</h1>
            <p className="text-zinc-500 mb-6">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-6 text-left bg-zinc-100 p-4 rounded-xl overflow-auto text-xs text-zinc-800">
                <pre>{this.state.error.message}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
