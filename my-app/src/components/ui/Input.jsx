import React from "react";

const Input = ({ value, onChange, placeholder }) => {
  return (
    <input
      className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none"
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

export default Input;
