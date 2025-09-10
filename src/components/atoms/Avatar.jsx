import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Avatar = React.forwardRef(({ 
  src,
  name,
  size = "md",
  className,
  fallbackIcon = "User",
  ...props 
}, ref) => {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
    "2xl": "w-16 h-16",
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    "2xl": 32,
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const baseStyles = "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-medium overflow-hidden";

  if (src) {
    return (
      <div
        ref={ref}
        className={cn(baseStyles, sizes[size], className)}
        {...props}
      >
        <img
          src={src}
          alt={name || "Avatar"}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (name) {
    return (
      <div
        ref={ref}
        className={cn(baseStyles, sizes[size], "text-xs font-bold", className)}
        {...props}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(baseStyles, sizes[size], className)}
      {...props}
    >
      <ApperIcon name={fallbackIcon} size={iconSizes[size]} />
    </div>
  );
});

Avatar.displayName = "Avatar";

export default Avatar;