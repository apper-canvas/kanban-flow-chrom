import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Textarea = React.forwardRef(({ 
  label,
  error,
  rows = 3,
  className,
  containerClassName,
  ...props 
}, ref) => {
  const baseStyles = "w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white resize-none";
  const errorStyles = error ? "border-error focus:ring-error/50 focus:border-error" : "border-gray-300";

  return (
    <div className={cn("space-y-1", containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(baseStyles, errorStyles, className)}
        {...props}
      />
      {error && (
        <p className="text-sm text-error flex items-center mt-1">
          <ApperIcon name="AlertCircle" size={14} className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

export default Textarea;