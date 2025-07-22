import React from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get protected video URL
const getProtectedVideoUrl = (filename) => {
  return `${API_BASE_URL}/media/video/${filename}`;
};

const Loading = () => {
  return (
    <div className="loading">
     <video className="loading-image" autoPlay muted width="100%" loop playsInline controls={false}>
            <source src={getProtectedVideoUrl('HYPERSPEKTIV.mp4')} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
    </div>
  );
};

export default Loading;
