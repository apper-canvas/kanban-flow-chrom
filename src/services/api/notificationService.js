import { toast } from 'react-toastify';

class NotificationService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'notification_c';
  }

  async getAll(filters = {}) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "recipient_id_c"}, "referenceField": {"field": {"Name": "name_c"}}},
          {"field": {"Name": "message_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "sent_at_c"}},
          {"field": {"Name": "notification_type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };
      
      // Add filters
      if (filters.status) {
        params.where = [{"FieldName": "status_c", "Operator": "EqualTo", "Values": [filters.status]}];
      }
      
      if (filters.recipientId) {
        const whereClause = {"FieldName": "recipient_id_c", "Operator": "EqualTo", "Values": [filters.recipientId]};
        if (params.where) {
          params.where.push(whereClause);
        } else {
          params.where = [whereClause];
        }
      }
      
      // Add sorting by sent_at_c descending
      params.orderBy = [{"fieldName": "sent_at_c", "sorttype": "DESC"}];
      
      // Add pagination if specified
      if (filters.limit || filters.offset) {
        params.pagingInfo = {
          limit: filters.limit || 20,
          offset: filters.offset || 0
        };
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching notifications:", error?.response?.data?.message || error);
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
          {"field": {"Name": "recipient_id_c"}, "referenceField": {"field": {"Name": "name_c"}}},
          {"field": {"Name": "message_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "sent_at_c"}},
          {"field": {"Name": "notification_type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response?.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching notification ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(notificationData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: notificationData.Name || notificationData.subject_c || "Notification",
          Tags: notificationData.Tags || "",
          recipient_id_c: parseInt(notificationData.recipient_id_c),
          message_c: notificationData.message_c,
          status_c: notificationData.status_c || "unread",
          sent_at_c: notificationData.sent_at_c || new Date().toISOString(),
          notification_type_c: notificationData.notification_type_c || "push",
          subject_c: notificationData.subject_c
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
          toast.success("Notification created successfully");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating notification:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, notificationData) {
    try {
      // Only include Updateable fields
      const updateData = {
        Id: id
      };
      
      if (notificationData.Name !== undefined) updateData.Name = notificationData.Name;
      if (notificationData.Tags !== undefined) updateData.Tags = notificationData.Tags;
      if (notificationData.recipient_id_c !== undefined) updateData.recipient_id_c = parseInt(notificationData.recipient_id_c);
      if (notificationData.message_c !== undefined) updateData.message_c = notificationData.message_c;
      if (notificationData.status_c !== undefined) updateData.status_c = notificationData.status_c;
      if (notificationData.sent_at_c !== undefined) updateData.sent_at_c = notificationData.sent_at_c;
      if (notificationData.notification_type_c !== undefined) updateData.notification_type_c = notificationData.notification_type_c;
      if (notificationData.subject_c !== undefined) updateData.subject_c = notificationData.subject_c;
      
      const params = {
        records: [updateData]
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
          toast.success("Notification updated successfully");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating notification:", error?.response?.data?.message || error);
      return null;
    }
  }

  async delete(id) {
    try {
      const params = { 
        RecordIds: [id]
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
          toast.success("Notification deleted successfully");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting notification:", error?.response?.data?.message || error);
      return false;
    }
  }

  async getUnreadCount(recipientId) {
    try {
      const params = {
        fields: [{"field": {"Name": "Id"}}],
        where: [
          {"FieldName": "recipient_id_c", "Operator": "EqualTo", "Values": [recipientId]},
          {"FieldName": "status_c", "Operator": "EqualTo", "Values": ["unread"]}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return 0;
      }
      
      return response.data ? response.data.length : 0;
    } catch (error) {
      console.error("Error fetching unread count:", error?.response?.data?.message || error);
      return 0;
    }
  }

  async markAsRead(id) {
    return await this.update(id, { status_c: "read" });
  }

  async markAsArchived(id) {
    return await this.update(id, { status_c: "archived" });
  }

  async bulkMarkAsRead(ids) {
    try {
      const results = await Promise.all(
        ids.map(id => this.update(id, { status_c: "read" }))
      );
      
      const successCount = results.filter(r => r !== null).length;
      if (successCount > 0) {
        toast.success(`${successCount} notification${successCount > 1 ? 's' : ''} marked as read`);
      }
      
      return results;
    } catch (error) {
      console.error("Error bulk marking as read:", error);
      toast.error("Failed to mark notifications as read");
      return [];
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;