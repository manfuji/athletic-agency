import { cn } from "@/lib/utils";
import React from "react";

const Button = ({
  children,
  className,
  type,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "bg-primary text-white px-5 py-3 rounded-lg font-evogria",
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
