import React from 'react'
const Button = ({ children, onClick, className = "", ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`w-60 h-12 bg-blue-600 text-white rounded-lg shadow-md
         hover:bg-blue-700 transition-colors text-lg font-semibold ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button
