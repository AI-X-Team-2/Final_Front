import React from 'react'
const Button = ({ children, onClick, className = "", disabled, ...props }) => {
  const baseStyle = "w-60 h-12  rounded-lg shadow-md  text-lg font-semibold ";
  const disabledStyle = "bg-gray-400 ";
  const activeStyle = "bg-blue-600 text-white hover:bg-blue-700 transition-colors"
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${disabled ? disabledStyle : activeStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button
