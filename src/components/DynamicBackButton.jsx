import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '../context/NavigationContext';

const DynamicBackButton = ({ className = '', showIcon = true }) => {
  const navigate = useNavigate();
  const { getPreviousPage, getPageTitle, cameFrom } = useNavigation();
  
  const previousPage = getPreviousPage();
  const previousPageTitle = getPageTitle(previousPage);

  const handleBack = () => {
    navigate(-1); // Use browser history for more natural navigation
  };

  // Determine button text based on previous page
  const getButtonText = () => {
    if (cameFrom('/')) {
      return 'Back';
    } else if (cameFrom('/cache')) {
      return 'Back';
    } else if (cameFrom('/saved')) {
      return 'Back';
    } else if (cameFrom('/about')) {
      return 'Back';
    } else {
      return `Back to ${previousPageTitle}`;
    }
  };

  return (
    <button
      className={`dynamic-back-button ${className}`}
      onClick={handleBack}
      title={getButtonText()}
    >
      {showIcon && <FontAwesomeIcon icon={faArrowLeft} />}
      <span>{getButtonText()}</span>
    </button>
  );
};

export default DynamicBackButton; 