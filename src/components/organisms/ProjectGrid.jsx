import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ProgressBar from "@/components/atoms/ProgressBar";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const ProjectGrid = ({ projects = [], loading = false }) => {
  const navigate = useNavigate();

  const getStatusVariant = (status) => {
    const variants = {
      active: "success",
      completed: "primary",
      on_hold: "warning",
      cancelled: "error"
    };
    return variants[status] || "default";
  };

  const handleProjectClick = (project) => {
    navigate(`/kanban?project=${project.Id}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <motion.div
          key={project.Id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            hover
            className="cursor-pointer group"
            onClick={() => handleProjectClick(project)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                {project.name}
              </h3>
{project.status_c && (
                <Badge variant={getStatusVariant(project.status_c)} size="sm">
                  {project.status_c.replace("_", " ")}
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {project.description}
            </p>
            
            <div className="mb-4">
              <ProgressBar 
                value={project.progress} 
                showLabel 
                variant="primary"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ApperIcon name="Calendar" size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">
{project.due_date_c && (
                    <>Due {format(new Date(project.due_date_c), "MMM d, yyyy")}</>
                  )}
                </span>
              </div>
              
              <div className="flex items-center -space-x-1">
                {project.teamMembers?.slice(0, 3).map((member, idx) => (
                  <Avatar
                    key={idx}
                    name={`Member ${member}`}
                    size="sm"
                    className="border-2 border-white"
                  />
                ))}
                {project.teamMembers?.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600">
                      +{project.teamMembers.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default ProjectGrid;