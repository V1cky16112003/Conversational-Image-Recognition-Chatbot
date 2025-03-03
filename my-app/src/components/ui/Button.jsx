import React from "react";

const Button = ({ children, onClick, className }) => {
  return (
    <button
      className={`p-2 rounded-lg text-white transition-transform transform hover:scale-105 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
