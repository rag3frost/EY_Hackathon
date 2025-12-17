import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-black text-white p-8">
                    <div className="max-w-md w-full bg-red-900/20 border border-red-500/50 p-6 rounded-xl">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
                        <p className="text-gray-300 mb-4">The application encountered an error.</p>
                        <pre className="bg-black/50 p-4 rounded text-xs text-red-300 overflow-auto">
                            {this.state.error?.toString()}
                        </pre>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            className="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
                        >
                            Clear Data & Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
