import { toast } from 'react-toastify';

class TaskService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'task_c';
  }

  async getAll(filters = {}) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "progress_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "attachments_c"}},
          {"field": {"Name": "project_id_c"}},
          {"field": {"Name": "assignee_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };
      
      // Add filters if specified
      if (filters.projectId || filters.status || filters.assigneeId || filters.priority || filters.search) {
        params.where = [];
        
        if (filters.projectId) {
          params.where.push({
            FieldName: "project_id_c",
            Operator: "EqualTo", 
            Values: [parseInt(filters.projectId)],
            Include: true
          });
        }
        
        if (filters.status) {
          params.where.push({
            FieldName: "status_c",
            Operator: "EqualTo",
            Values: [filters.status],
            Include: true
          });
        }
        
        if (filters.assigneeId) {
          params.where.push({
            FieldName: "assignee_id_c",
            Operator: "EqualTo",
            Values: [parseInt(filters.assigneeId)],
            Include: true
          });
        }
        
        if (filters.priority) {
          params.where.push({
            FieldName: "priority_c",
            Operator: "EqualTo",
            Values: [filters.priority],
            Include: true
          });
        }
        
        if (filters.search) {
          params.whereGroups = [{
            operator: "OR",
            subGroups: [{
              conditions: [
                {
                  fieldName: "title_c",
                  operator: "Contains",
                  values: [filters.search]
                },
                {
                  fieldName: "description_c", 
                  operator: "Contains",
                  values: [filters.search]
                }
              ],
              operator: "OR"
            }]
          }];
        }
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "progress_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "attachments_c"}},
          {"field": {"Name": "project_id_c"}},
          {"field": {"Name": "assignee_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(taskData) {
    try {
      // Only include updateable fields
      const params = {
        records: [{
          Name: taskData.Name || taskData.title_c,
          Tags: taskData.Tags || "",
          title_c: taskData.title_c || taskData.Name,
          description_c: taskData.description_c || "",
          status_c: taskData.status_c || "todo",
          due_date_c: taskData.due_date_c || new Date().toISOString(),
          priority_c: taskData.priority_c || "medium",
          progress_c: taskData.progress_c || 0,
          created_at_c: new Date().toISOString(),
          position_c: await this.getNextPosition(taskData.status_c || "todo"),
          attachments_c: taskData.attachments_c || "",
          project_id_c: taskData.project_id_c ? parseInt(taskData.project_id_c) : null,
          assignee_id_c: taskData.assignee_id_c ? parseInt(taskData.assignee_id_c) : null
        }]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel || 'Error'}: ${error.message || error}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Task created successfully");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, taskData) {
    try {
      // Only include updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: taskData.Name || taskData.title_c,
          Tags: taskData.Tags || "",
          title_c: taskData.title_c || taskData.Name,
          description_c: taskData.description_c,
          status_c: taskData.status_c,
          due_date_c: taskData.due_date_c,
          priority_c: taskData.priority_c,
          progress_c: taskData.progress_c,
          position_c: taskData.position_c,
          attachments_c: taskData.attachments_c,
          project_id_c: taskData.project_id_c ? parseInt(taskData.project_id_c) : null,
          assignee_id_c: taskData.assignee_id_c ? parseInt(taskData.assignee_id_c) : null
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel || 'Error'}: ${error.message || error}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Task updated successfully");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error);
      return null;
    }
  }

  async delete(id) {
    try {
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Task deleted successfully");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error);
      return false;
    }
  }

  async getTaskStats() {
    try {
      const tasks = await this.getAll();
      
      const todoTasks = tasks.filter(t => t.status_c === "todo");
      const inProgressTasks = tasks.filter(t => t.status_c === "in-progress");
      const doneTasks = tasks.filter(t => t.status_c === "done");
      const overdueTasks = tasks.filter(t => 
        new Date(t.due_date_c) < new Date() && t.status_c !== "done"
      );

      return {
        totalTasks: tasks.length,
        todoTasks: todoTasks.length,
        inProgressTasks: inProgressTasks.length,
        doneTasks: doneTasks.length,
        overdueTasks: overdueTasks.length
      };
    } catch (error) {
      console.error("Error getting task stats:", error);
      return {
        totalTasks: 0,
        todoTasks: 0,
        inProgressTasks: 0,
        doneTasks: 0,
        overdueTasks: 0
      };
    }
  }

  async getNextPosition(status) {
    try {
      const tasks = await this.getAll({ status });
      return tasks.length > 0 ? Math.max(...tasks.map(t => t.position_c || 0)) + 1 : 1;
    } catch (error) {
      console.error("Error getting next position:", error);
      return 1;
    }
  }

  async uploadFile(taskId, file) {
    try {
      // For now, simulate file upload by storing file info in attachments_c field
      const task = await this.getById(taskId);
      if (!task) {
        toast.error("Task not found");
        return null;
      }

      const fileData = {
        Id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString()
      };

      let attachments = [];
      try {
        attachments = task.attachments_c ? JSON.parse(task.attachments_c) : [];
      } catch (e) {
        attachments = [];
      }
      
      attachments.push(fileData);
      
      await this.update(taskId, { 
        attachments_c: JSON.stringify(attachments)
      });

      return fileData;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  }

  async deleteFile(taskId, fileId) {
    try {
      const task = await this.getById(taskId);
      if (!task) {
        toast.error("Task not found");
        return false;
      }

      let attachments = [];
      try {
        attachments = task.attachments_c ? JSON.parse(task.attachments_c) : [];
      } catch (e) {
        attachments = [];
      }
      
      attachments = attachments.filter(file => file.Id !== fileId);
      
      await this.update(taskId, { 
        attachments_c: JSON.stringify(attachments)
      });

      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  async getFileUrl(taskId, fileId) {
    try {
      const task = await this.getById(taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      let attachments = [];
      try {
        attachments = task.attachments_c ? JSON.parse(task.attachments_c) : [];
      } catch (e) {
        attachments = [];
      }

      const file = attachments.find(f => f.Id === fileId);
      if (!file) {
        throw new Error("File not found");
      }

      return file.url;
    } catch (error) {
      console.error("Error getting file URL:", error);
      throw error;
    }
  }
}

export default new TaskService();