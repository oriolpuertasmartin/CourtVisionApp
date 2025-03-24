import React from "react";

type InputFieldProps = {
    label: string;
    required?: boolean;
  };
  
  const InputField: React.FC<InputFieldProps> = ({ label, required = false }) => {
    return (
      <div className="flex flex-col">
        <label className="text-gray-700 font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          className="p-2 border rounded-lg bg-[#FDF7E8] focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
    );
  };
  
  export default InputField;