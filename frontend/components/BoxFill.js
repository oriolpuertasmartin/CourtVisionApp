// BoxFill.tsx
import React from "react";

type BoxFillProps = {
  children: React.ReactNode;
  className?: string;
};

const BoxFill: React.FC<BoxFillProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-[#E8E0C9] p-6 rounded-xl shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default BoxFill;
