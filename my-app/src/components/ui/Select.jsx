// src/components/ui/Select.jsx
import React from "react";

const Select = ({ options, onChange, value }) => {
  return (
    <select
      className="p-2 border rounded-md bg-gray-800 text-white"
      value={value}
      onChange={onChange}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
