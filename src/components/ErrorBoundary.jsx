import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ padding: '20px', backgroundColor: '#442222', border: '1px solid red', borderRadius: '8px' }}>
          <h3 style={{ color: 'red' }}>Something went wrong.</h3>
          <pre style={{ color: 'white', whiteSpace: 'pre-wrap' }}>
            {this.state.error.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;