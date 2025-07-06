import React from 'react';

const SocialXIcon = ({ size = 40, color = '#1976d2', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <rect width="40" height="40" rx="10" fill={color}/>
    <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize="18" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fill="white">Sx</text>
  </svg>
);

export default SocialXIcon; 