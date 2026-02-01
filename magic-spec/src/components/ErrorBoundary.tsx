import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}
interface ErrorBoundaryProps {
  children: React.ReactNode;
}
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState>
{
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false
    };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 text-center mb-4">
              We're having trouble loading this page. Please try refreshing or
              contact support if the problem persists.
            </p>
            <div className="text-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">

                Refresh Page
              </button>
            </div>
            {this.state.error && process.env.NODE_ENV === 'development' &&
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-mono text-gray-700 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            }
          </div>
        </div>);

    }
    return this.props.children;
  }
}