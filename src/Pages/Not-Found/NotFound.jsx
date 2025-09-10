import React from 'react';
import './NotFound.css'

const NotFoundPage = () => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        {/* 404 Error Number */}
        <div className="error-code">
          <h1>404</h1>
        </div>

        {/* Error Message */}
        <div className="error-message">
          <h2>Page Not Found</h2>
        </div>

        {/* Illustration/Icon Area */}
        <div className="error-illustration">
          <svg 
            width="100" 
            height="100" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Sad face */}
            <circle cx="50" cy="60" r="15" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
            <circle cx="45" cy="55" r="2" fill="#f59e0b"/>
            <circle cx="55" cy="55" r="2" fill="#f59e0b"/>
            <path d="M42 68 Q50 62 58 68" stroke="#f59e0b" strokeWidth="2" fill="none"/>
          </svg>
        </div>

        {/* Action Button */}
        <div className="error-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleGoHome}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;