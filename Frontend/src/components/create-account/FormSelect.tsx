import React from "react";

// Define the data structure for individual select dropdown options
interface Option {
  value: string;
  label: string;
}

// Extend standard HTML select attributes with custom label, options list, and indicator flags
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  required?: boolean;
  optional?: boolean;
}

// Render a reusable form dropdown select component
export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  required,
  optional,
  className = "",
  ...props
}) => {
  return (
    // Wrapper container for the select field group
    <div>
      {/* Field label with dynamic required asterisk and optional indicator */}
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label}{" "}
        {required && <span className="text-[#F0B429]">*</span>}
        {optional && <span className="text-slate-400 font-normal">(optional)</span>}
      </label>
      {/* Styled native HTML select element */}
      <select
        required={required}
        className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#0B0F1E] focus:bg-white focus:ring-2 focus:ring-[#2DD4BF] focus:border-[#2DD4BF] focus:outline-none transition ${className}`}
        {...props}
      >
        {/* Map through the options array to render individual option elements */}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};