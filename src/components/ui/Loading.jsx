import React from "react";

const Loading = ({ type = "default", className = "" }) => {
  if (type === "dashboard") {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-gray-200 rounded-xl h-64"></div>
          <div className="bg-gray-200 rounded-xl h-64"></div>
        </div>
      </div>
    );
  }

  if (type === "kanban") {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {["To Do", "In Progress", "Done"].map((status, i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-4">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="bg-gray-200 rounded-lg h-24"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "gantt") {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-100 rounded-xl p-6">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-48 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
      </div>
    </div>
  );
};

export default Loading;