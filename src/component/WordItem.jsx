// src/components/WordItem.jsx
import React from 'react';

const WordItem = ({ word, selected, onToggle }) => {
  return (
    <div
      className={`flex justify-between items-center px-4 py-2 rounded-lg border ${
        selected ? 'bg-blue-100 border-blue-400' : 'bg-gray-800 border-gray-600'
      } cursor-pointer`}
      onClick={onToggle}
    >
      <span className="text-white text-base">{word}</span>
      <input type="checkbox" checked={selected} readOnly className="w-5 h-5" />
    </div>
  );
};

export default WordItem;

