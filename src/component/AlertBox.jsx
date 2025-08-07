// src/components/AlertBox.jsx
import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid"; // Heroicons 설치 필요

const AlertBox = ({ message, onClose }) => {
  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg flex items-center gap-2">
      <span>{message}</span>
      <button onClick={onClose}>
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default AlertBox;
