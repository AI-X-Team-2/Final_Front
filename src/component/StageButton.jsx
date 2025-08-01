import React from 'react';

const StageButton = ({ step, status, onClick }) => {
  const getStatusStyle = () => {
    switch (status) {
      case "current":
        return "bg-yellow-400 text-black ring-4 ring-yellow-300 animate-bounce";
      case "locked":
        return "bg-gray-300 text-gray-500 cursor-not-allowed";
      default:
        return "";
    }
  };

  return (
    <button
      className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shadow ${getStatusStyle()}`}
      onClick={onClick}
      disabled={status === "locked"}
    >
      {step}
    </button>
  );
};

export default StageButton;
