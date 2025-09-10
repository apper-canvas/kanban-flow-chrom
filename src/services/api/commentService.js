import { toast } from 'react-toastify';
import userService from "@/services/api/userService";

class CommentService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'comment_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "task_id_c"}},
          {"field": {"Name": "author_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching comments:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByTaskId(taskId) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "task_id_c"}},
          {"field": {"Name": "author_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          FieldName: "task_id_c",
          Operator: "EqualTo",
          Values: [parseInt(taskId)],
          Include: true
        }]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      const taskComments = response.data || [];
      
      // Enrich with user data
      const enrichedComments = await Promise.all(
        taskComments.map(async (comment) => {
          try {
            const author = await userService.getById(comment.author_id_c?.Id || comment.author_id_c);
            return { ...comment, author };
          } catch (error) {
            return { ...comment, author: null };
          }
        })
      );

      return enrichedComments.sort((a, b) => new Date(a.created_at_c) - new Date(b.created_at_c));
    } catch (error) {
      console.error("Error fetching task comments:", error?.response?.data?.message || error);
      return [];
    }
  }

  async create(commentData) {
    try {
      // Only include updateable fields
      const params = {
        records: [{
          Name: commentData.Name || `Comment ${new Date().toLocaleString()}`,
          Tags: commentData.Tags || "",
          content_c: commentData.content_c || "",
          created_at_c: new Date().toISOString(),
          task_id_c: commentData.task_id_c ? parseInt(commentData.task_id_c) : null,
          author_id_c: commentData.author_id_c ? parseInt(commentData.author_id_c) : null
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
          const newComment = successful[0].data;
          toast.success("Comment created successfully");
          
          // Return enriched comment
          try {
            const author = await userService.getById(newComment.author_id_c?.Id || newComment.author_id_c);
            return { ...newComment, author };
          } catch (error) {
            return { ...newComment, author: null };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating comment:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, commentData) {
    try {
      // Only include updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: commentData.Name || `Comment ${new Date().toLocaleString()}`,
          Tags: commentData.Tags || "",
          content_c: commentData.content_c,
          task_id_c: commentData.task_id_c ? parseInt(commentData.task_id_c) : null,
          author_id_c: commentData.author_id_c ? parseInt(commentData.author_id_c) : null
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
          toast.success("Comment updated successfully");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating comment:", error?.response?.data?.message || error);
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
          toast.success("Comment deleted successfully");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting comment:", error?.response?.data?.message || error);
      return false;
    }
  }
}

export default new CommentService();