import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import './NotFound.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="not-found">
      <div className="not-found__container">
        <div className="not-found__number">404</div>
        <h1 className="not-found__title">Page Not Found</h1>
        <p className="not-found__message">
          We couldn't find the page you're looking for. Don't worry, we'll take you back home.
        </p>
        
        <div className="not-found__countdown">
          <p className="not-found__redirect-text">
            Redirecting in <span className="not-found__countdown-number">{countdown}s</span>...
          </p>
        </div>

        <button
          className="not-found__btn"
          onClick={handleBackHome}
          aria-label="Go back to home"
        >
          <Home size={20} />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
