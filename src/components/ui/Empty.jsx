import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No items found", 
  description = "Get started by creating your first item",
  actionLabel = "Create New",
  onAction,
  icon = "Package",
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full flex items-center justify-center mb-6 animate-bounce-light">
        <ApperIcon name={icon} size={32} className="text-primary" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md leading-relaxed">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
        >
          <ApperIcon name="Plus" size={18} className="mr-2" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default Empty;