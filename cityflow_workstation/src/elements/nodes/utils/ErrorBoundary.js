import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      hasWarning: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
      this.props.error();
      this.props.stop();
      console.error(error, errorInfo);
  }

  componentDidCatchWarning(warning) {
      this.props.warning();
      console.warn(warning);
  }

  render() {
    if (this.state.hasError) {
      // return <div>Something went wrong.</div>;
    }

    if (this.state.hasWarning) {
      // return <div>Something went wrong.</div>;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
