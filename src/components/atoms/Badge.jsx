import React from "react";
import { cn } from "@/utils/cn";

const Badge = React.forwardRef(({ 
  children, 
  variant = "default", 
  size = "md",
  className,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full transition-all duration-200";
  
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-gradient-to-r from-primary to-accent text-white shadow-sm",
    success: "bg-gradient-to-r from-success to-green-600 text-white shadow-sm",
    warning: "bg-gradient-to-r from-warning to-yellow-600 text-white shadow-sm",
    error: "bg-gradient-to-r from-error to-red-600 text-white shadow-sm",
    info: "bg-gradient-to-r from-info to-blue-600 text-white shadow-sm",
    secondary: "bg-gray-200 text-gray-700",
    outline: "border border-gray-300 text-gray-700 bg-white",
  };
  
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-sm",
  };

  return (
    <span
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;