import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";
import { toast } from "react-toastify";

const KanbanBoard = ({ 
  tasks = [], 
  onTaskUpdate, 
  onTaskClick,
  onTaskCreate,
  users = [],
  loading = false 
}) => {
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const columns = [
    { id: "todo", title: "To Do", status: "todo", color: "bg-gray-500" },
    { id: "in-progress", title: "In Progress", status: "in-progress", color: "bg-blue-500" },
    { id: "done", title: "Done", status: "done", color: "bg-green-500" }
  ];

  const getTasksByStatus = (status) => {
return tasks.filter(task => task.status_c === status).sort((a, b) => (a.position_c || 0) - (b.position_c || 0));
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "error",
      medium: "warning",
      low: "success"
    };
    return colors[priority] || "default";
  };

  const getUserById = (userId) => {
    return users.find(user => user.Id.toString() === userId.toString());
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedTask || draggedTask.status === newStatus) return;

    try {
      const updatedTask = { ...draggedTask, status: newStatus };
      await onTaskUpdate(updatedTask.Id, updatedTask);
      toast.success("Task moved successfully!");
    } catch (error) {
      toast.error("Failed to move task");
    }
  };

  const TaskCard = ({ task }) => {
const assignee = getUserById(task.assignee_id_c?.Id || task.assignee_id_c);
    const isOverdue = new Date(task.due_date_c) < new Date() && task.status_c !== "done";

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -2 }}
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        onDragEnd={handleDragEnd}
        className={`cursor-pointer select-none ${draggedTask?.Id === task.Id ? "opacity-50" : ""}`}
      >
        <Card 
          padding="md" 
          hover
          onClick={() => onTaskClick(task)}
          className="group"
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
{task.title_c || task.Name}
            </h4>
            <Badge variant={getPriorityColor(task.priority_c)} size="sm">
              {task.priority_c}
            </Badge>
          </div>
          
<p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description_c}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ApperIcon 
                name="Calendar" 
                size={12} 
                className={isOverdue ? "text-error" : "text-gray-400"} 
              />
              <span className={`text-xs ${isOverdue ? "text-error font-medium" : "text-gray-500"}`}>
{format(new Date(task.due_date_c), "MMM d")}
              </span>
              {isOverdue && (
                <Badge variant="error" size="sm">Overdue</Badge>
              )}
            </div>
            
            {assignee && (
              <Avatar
name={assignee.name_c || assignee.Name}
                src={assignee.avatar_c}
                size="sm"
              />
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  const Column = ({ column }) => {
    const columnTasks = getTasksByStatus(column.status);
    const isDragOver = dragOverColumn === column.id;

    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <Badge variant="secondary" size="sm">
              {columnTasks.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon="Plus"
            onClick={() => onTaskCreate(column.status)}
          />
        </div>
        
        <div
          className={`min-h-[500px] bg-gray-50 rounded-lg p-3 transition-all duration-200 ${
            isDragOver ? "bg-primary/10 border-2 border-dashed border-primary" : ""
          }`}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.status)}
        >
          <AnimatePresence>
            <div className="space-y-3">
              {columnTasks.map((task) => (
                <TaskCard key={task.Id} task={task} />
              ))}
            </div>
          </AnimatePresence>
          
          {columnTasks.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <ApperIcon name="Package" size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No tasks yet</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map((column) => (
        <Column key={column.id} column={column} />
      ))}
    </div>
  );
};

export default KanbanBoard;