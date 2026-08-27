import React from "react";

// Extend native HTML input attributes with custom label, indicator, and icon props
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  optional?: boolean;
  icon?: React.ReactNode;
}

// Render a reusable form input component with label, validation indicators, and optional icon
export const FormInput: React.FC<FormInputProps> = ({
  label,
  required,
  optional,
  icon,
  className = "",
  ...props
}) => {
  return (
    // Wrapper container for the entire input field group
    <div>
      {/* Field label with dynamic required asterisk and optional text badge */}
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label}{" "}
        {required && <span className="text-[#F0B429]">*</span>}
        {optional && <span className="text-slate-400 font-normal">(optional)</span>}
      </label>
      {/* Relative container to allow absolute positioning of the leading icon */}
      <div className="relative">
        {/* Render the optional leading icon vertically centered inside the input */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        {/* Native input element styled with dynamic padding when an icon is present */}
        <input
          required={required}
          className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#0B0F1E] focus:bg-white focus:ring-2 focus:ring-[#2DD4BF] focus:border-[#2DD4BF] focus:outline-none transition ${
            icon ? "pl-9" : ""
          } ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};