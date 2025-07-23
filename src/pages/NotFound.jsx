import React, {useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Get protected video URL
const getProtectedVideoUrl = (filename) => {
  return `${API_BASE_URL}/media/video/${filename}`;
};

export default function NotFoundPage() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate loading time for demonstration (e.g., 2 seconds)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer); // Cleanup
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="not-found-container">
      <div className='not-found-img'>
          <video className="not-found-image" autoPlay muted width="auto" loop playsInline controls={false}>
            <source src={getProtectedVideoUrl('error.mp4')} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
    </div>
      <h1 className="not-found-heading">404 - Page Not Found</h1>
      <p className="not-found-message">The page you're looking for doesn't exist.</p>
      <Link to="/">
        <button className="not-found-button">Go to Home</button>
      </Link>
    </div>
  );
}
