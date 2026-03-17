import React from 'react';

export const Logo = ({ className = "w-8 h-8", color }: { className?: string, color?: string }) => {
  return (
    <img 
      src="/sendlyfi-logo.png" 
      alt="SendlyFi" 
      className={className}
    />
  );
};
