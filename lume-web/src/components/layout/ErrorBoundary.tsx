import React, { ReactNode, ErrorInfo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import '../layout/ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details to console for debugging
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRefresh={this.handleRefresh} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  onRefresh: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ onRefresh }) => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/');
    onRefresh();
  };

  return (
    <div className="error-fallback">
      <div className="error-fallback__container">
        <div className="error-fallback__icon">
          <AlertCircle size={64} />
        </div>
        <h1 className="error-fallback__title">Something Went Wrong</h1>
        <p className="error-fallback__message">
          We're sorry, but something unexpected happened. Please try refreshing the page or return to home.
        </p>
        
        <div className="error-fallback__actions">
          <button
            className="error-fallback__btn error-fallback__btn--primary"
            onClick={onRefresh}
            aria-label="Refresh page"
          >
            <RotateCcw size={20} />
            <span>Refresh</span>
          </button>
          <button
            className="error-fallback__btn error-fallback__btn--secondary"
            onClick={handleBackHome}
            aria-label="Go back to home"
          >
            <Home size={20} />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
