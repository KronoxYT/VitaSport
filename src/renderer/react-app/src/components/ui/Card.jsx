import { memo } from 'react';

// Use CSS-based animations instead of framer-motion for better performance
export const Card = memo(({ children, index = 0, className = '' }) => {
  const animationStyle = {
    animationDelay: `${index * 0.1}s`
  };

  return (
    <div
      style={animationStyle}
      className={`bg-white rounded-xl shadow-sm transition-transform duration-200 hover:-translate-y-0.5 animate-fadeInUp ${className}`}
    >
      {children}
    </div>
  );
});