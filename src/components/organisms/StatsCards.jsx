import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const StatsCards = ({ stats, loading = false }) => {
  const defaultStats = [
    { 
      title: "Total Projects", 
      value: "0", 
      change: "0%", 
      trend: "up", 
      icon: "FolderOpen",
      color: "from-blue-500 to-blue-600"
    },
    { 
      title: "Active Tasks", 
      value: "0", 
      change: "0%", 
      trend: "up", 
      icon: "CheckSquare",
      color: "from-green-500 to-green-600"
    },
    { 
title: "Team Members", 
      value: stats?.teamMembers?.toString() || "0", 
      change: stats?.teamMembersChange || "0%", 
      trend: "up", 
      icon: "Users",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const displayStats = stats || defaultStats;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {displayStats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card hover className="relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-8 -mt-8`}></div>
            
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <ApperIcon name={stat.icon} size={24} className="text-white" />
                </div>
              </div>
              
              <div className="flex items-center mt-4">
                <div className={`flex items-center ${
                  stat.trend === "up" ? "text-success" : "text-error"
                }`}>
                  <ApperIcon 
                    name={stat.trend === "up" ? "TrendingUp" : "TrendingDown"} 
                    size={16} 
                    className="mr-1" 
                  />
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;