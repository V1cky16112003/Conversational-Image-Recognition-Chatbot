import React from "react";

const Card = ({ children, className }) => {
  return <div className={`p-4 rounded-2xl bg-gray-800 shadow-lg ${className}`}>{children}</div>;
};

export default Card;
