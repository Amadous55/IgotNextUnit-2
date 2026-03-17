import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

// Displayed when a user navigates to an unknown route
const NotFound = () => {
  return (
    <main className="not-found-container">
      <div className="not-found-content">
        <span className="not-found-icon">🏀</span>
        <h1 className="not-found-title">404</h1>
        <p className="not-found-subtitle">Looks like this court doesn't exist.</p>
        <Link to="/" className="not-found-btn">Back to Home</Link>
      </div>
    </main>
  );
};

export default NotFound;
