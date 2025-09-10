import React from "react";
import { cn } from "@/utils/cn";

const ProgressBar = React.forwardRef(({ 
  value = 0,
  max = 100,
  size = "md",
  variant = "primary",
  showLabel = false,
  className,
  ...props 
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
    xl: "h-4",
  };

  const variants = {
    primary: "bg-gradient-to-r from-primary to-accent",
    success: "bg-gradient-to-r from-success to-green-600",
    warning: "bg-gradient-to-r from-warning to-yellow-600",
    error: "bg-gradient-to-r from-error to-red-600",
    info: "bg-gradient-to-r from-info to-blue-600",
  };

  const baseStyles = "w-full bg-gray-200 rounded-full overflow-hidden";

  return (
    <div ref={ref} className={cn("space-y-1", className)} {...props}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn(baseStyles, sizes[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";

export default ProgressBar;