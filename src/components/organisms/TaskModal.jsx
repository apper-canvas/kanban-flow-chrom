import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import UserSelect from "@/components/molecules/UserSelect";
import FormField from "@/components/molecules/FormField";
import FileUpload from "@/components/molecules/FileUpload";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";

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
title_c: "",
    description_c: "",
    status_c: "todo",
    priority_c: "medium",
    assignee_id_c: "",
    due_date_c: "",
    progress_c: 0,
    attachments_c: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
if (task) {
      setFormData({
        title_c: task.title_c || task.Name || "",
        description_c: task.description_c || "",
        status_c: task.status_c || "todo",
        priority_c: task.priority_c || "medium",
        assignee_id_c: (task.assignee_id_c?.Id || task.assignee_id_c)?.toString() || "",
        due_date_c: task.due_date_c ? task.due_date_c.split("T")[0] : "",
        progress_c: task.progress_c || 0,
        attachments_c: task.attachments_c || ""
      });
} else if (isNew) {
      setFormData({
        title_c: "",
        description_c: "",
        status_c: "todo",
        priority_c: "medium",
        assignee_id_c: "",
        due_date_c: "",
        progress_c: 0,
        attachments_c: ""
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

const handleFilesChange = (files) => {
    setFormData(prev => ({
      ...prev,
      attachments_c: files
    }));
  };

const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title_c?.trim()) {
      newErrors.title_c = "Title is required";
    }
    
    if (!formData.due_date_c) {
      newErrors.due_date_c = "Due date is required";
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
        Name: formData.title_c,
        due_date_c: new Date(formData.due_date_c).toISOString(),
        progress_c: Number(formData.progress_c),
        assignee_id_c: formData.assignee_id_c ? parseInt(formData.assignee_id_c) : null,
        attachments_c: formData.attachments_c
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

const assignedUser = users.find(user => user.Id.toString() === formData.assignee_id_c);

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
              name="title_c"
              value={formData.title_c}
              onChange={handleInputChange}
              error={errors.title_c}
              placeholder="Enter task title"
            />
          </div>

<div className="md:col-span-2">
            <FormField
              type="textarea"
              label="Description"
              name="description_c"
              value={formData.description_c}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter task description"
            />
          </div>

<FormField
            type="select"
            label="Status"
            name="status_c"
            value={formData.status_c}
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
            name="priority_c"
            value={formData.priority_c}
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
            value={formData.assignee_id_c}
            onChange={handleInputChange}
            name="assignee_id_c"
          />

          <FormField
            type="date"
            label="Due Date"
name="due_date_c"
            value={formData.due_date_c}
onChange={handleInputChange}
            error={errors.due_date_c}
          />

          <div className="md:col-span-2">
            <FormField
type="range"
              label={`Progress (${formData.progress_c}%)`}
name="progress_c"
              value={formData.progress_c}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="5"
            />
          </div>
</div>

        {/* File Attachments Section */}
<div className="mt-6">
          <FileUpload 
            files={formData.attachments_c}
            onFilesChange={handleFilesChange}
            disabled={loading}
          />
        </div>

        {!isNew && task && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Task Information</h4>
              <div className="flex items-center space-x-2">
<Badge variant={getStatusColor(formData.status_c)}>
                  {formData.status_c.replace("-", " ")}
                </Badge>
                <Badge variant={getPriorityColor(formData.priority_c)}>
                  {formData.priority_c} priority
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
<span className="text-gray-500">Created:</span>
                <p className="font-medium">
                  {format(new Date(task.created_at_c || task.CreatedOn), "MMM d, yyyy")}
                </p>
              </div>
              
              {assignedUser && (
                <div>
<span className="text-gray-500">Assignee:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar name={assignedUser.name_c || assignedUser.Name} size="sm" />
                    <span className="font-medium">{assignedUser.name_c || assignedUser.Name}</span>
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