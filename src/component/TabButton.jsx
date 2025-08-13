// src/components/TabButton.jsx
import React from "react";

const TabButton = ({ label, active, onClick, disabled, badge }) => {
  return (
    <button
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      className={[
        "px-3 py-2 rounded-full text-sm font-semibold transition",
        active ? "bg-white text-custom_blue" : "bg-white/10 text-white hover:bg-white/20",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <span>{label}</span>
      {typeof badge === "number" && (
        <span className="ml-2 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-bold bg-black/30 text-white">
          {badge}
        </span>
      )}
    </button>
  );
};

export default TabButton;
