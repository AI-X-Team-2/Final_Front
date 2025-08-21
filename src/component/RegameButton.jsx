import React from 'react';

const RegameButton = ({
  label,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={` h-12 py-2 rounded-xl shadow-md text-white mx-4
        ${disabled ? 'bg-customLightGray cursor-not-allowed' : 'bg-custom_blue  '}
       ${className}`}
    >
      {label}
    </button>
  );
};

export default RegameButton;
