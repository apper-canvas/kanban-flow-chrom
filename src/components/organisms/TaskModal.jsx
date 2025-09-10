import React, { useState, useEffect } from "react";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import UserSelect from "@/components/molecules/UserSelect";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";
import { toast } from "react-toastify";

const TaskModal = ({ 
  isOpen, 
  onClose, 
  task, 
  onSave, 
  onDelete,
  users = [],
  isNew = false 
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assigneeId: "",
    dueDate: "",
    progress: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        assigneeId: task.assigneeId || "",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        progress: task.progress || 0
      });
    } else if (isNew) {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assigneeId: "",
        dueDate: "",
        progress: 0
      });
    }
  }, [task, isNew]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const taskData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        progress: Number(formData.progress)
      };
      
      await onSave(taskData);
      toast.success(isNew ? "Task created successfully!" : "Task updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm("Are you sure you want to delete this task?")) return;
    
    setLoading(true);
    
    try {
      await onDelete(task.Id);
      toast.success("Task deleted successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: "secondary",
      "in-progress": "info",
      done: "success"
    };
    return colors[status] || "secondary";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "error",
      medium: "warning",
      low: "success"
    };
    return colors[priority] || "secondary";
  };

  const assignedUser = users.find(user => user.Id.toString() === formData.assigneeId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isNew ? "Create New Task" : "Task Details"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FormField
              label="Task Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              error={errors.title}
              placeholder="Enter task title"
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              type="textarea"
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter task description"
            />
          </div>

          <FormField
            type="select"
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            options={[
              { value: "todo", label: "To Do" },
              { value: "in-progress", label: "In Progress" },
              { value: "done", label: "Done" }
            ]}
          />

          <FormField
            type="select"
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            options={[
              { value: "high", label: "High Priority" },
              { value: "medium", label: "Medium Priority" },
              { value: "low", label: "Low Priority" }
            ]}
          />

          <UserSelect
            label="Assignee"
            users={users}
            value={formData.assigneeId}
            onChange={handleInputChange}
            name="assigneeId"
          />

          <FormField
            type="date"
            label="Due Date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            error={errors.dueDate}
          />

          <div className="md:col-span-2">
            <FormField
              type="range"
              label={`Progress (${formData.progress}%)`}
              name="progress"
              value={formData.progress}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="5"
            />
          </div>
        </div>

        {!isNew && task && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Task Information</h4>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusColor(formData.status)}>
                  {formData.status.replace("-", " ")}
                </Badge>
                <Badge variant={getPriorityColor(formData.priority)}>
                  {formData.priority} priority
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <p className="font-medium">
                  {format(new Date(task.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              
              {assignedUser && (
                <div>
                  <span className="text-gray-500">Assignee:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar name={assignedUser.name} size="sm" />
                    <span className="font-medium">{assignedUser.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t">
          <div>
            {!isNew && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                loading={loading}
                icon="Trash2"
              >
                Delete Task
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              icon="Save"
            >
              {isNew ? "Create Task" : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;