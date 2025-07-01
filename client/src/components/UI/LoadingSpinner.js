import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const spinnerSize = {
    sm: '20px',
    md: '40px',
    lg: '60px'
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '200px' }}>
      <div 
        className="spinner"
        style={{ 
          width: spinnerSize[size], 
          height: spinnerSize[size],
          border: `${size === 'sm' ? '2px' : '4px'} solid #f3f3f3`,
          borderTop: `${size === 'sm' ? '2px' : '4px'} solid #1877f2`
        }}
      ></div>
      {text && <p className="mt-3 text-muted">{text}</p>}
      
    </div>
  );
};

export default LoadingSpinner;