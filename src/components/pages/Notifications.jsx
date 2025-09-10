import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import NotificationItem from "@/components/atoms/NotificationItem";
import FilterBar from "@/components/molecules/FilterBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import Modal from "@/components/molecules/Modal";
import notificationService from "@/services/api/notificationService";
import {
  setNotifications,
  setUnreadCount,
  setLoading,
  setError,
  markAsRead,
  bulkMarkAsRead,
  removeNotification,
  updateNotification
} from "@/store/notificationSlice";
import { toast } from "react-toastify";

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading, error } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.user);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Selection
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Modal states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  
  // Filtered notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesStatus = !statusFilter || notification.status_c === statusFilter;
    const matchesType = !typeFilter || notification.notification_type_c === typeFilter;
    const matchesSearch = !searchValue || 
      (notification.subject_c || '').toLowerCase().includes(searchValue.toLowerCase()) ||
      (notification.message_c || '').toLowerCase().includes(searchValue.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [statusFilter, typeFilter, searchValue]);

  const loadNotifications = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getAll({ recipientId: user.userId }),
        notificationService.getUnreadCount(user.userId)
      ]);
      
      dispatch(setNotifications(notificationsData));
      dispatch(setUnreadCount(unreadCountData));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      dispatch(markAsRead(notificationId));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAsArchived = async (notificationId) => {
    try {
      await notificationService.markAsArchived(notificationId);
      dispatch(updateNotification({
        id: notificationId,
        updates: { status_c: 'archived' }
      }));
    } catch (error) {
      console.error("Error archiving notification:", error);
      toast.error("Failed to archive notification");
    }
  };

  const handleDelete = (notificationId) => {
    setNotificationToDelete(notificationId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!notificationToDelete) return;
    
    try {
      const success = await notificationService.delete(notificationToDelete);
      if (success) {
        dispatch(removeNotification(notificationToDelete));
        setSelectedNotifications(prev => prev.filter(id => id !== notificationToDelete));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    } finally {
      setDeleteConfirmOpen(false);
      setNotificationToDelete(null);
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      await notificationService.bulkMarkAsRead(selectedNotifications);
      dispatch(bulkMarkAsRead(selectedNotifications));
      setSelectedNotifications([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error bulk marking as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
      setSelectAll(false);
    } else {
      setSelectedNotifications(paginatedNotifications.map(n => n.Id));
      setSelectAll(true);
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      const newSelection = prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId];
      
      setSelectAll(newSelection.length === paginatedNotifications.length);
      return newSelection;
    });
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setTypeFilter("");
    setSearchValue("");
  };

  const getNotificationCounts = () => {
    const counts = {
      unread: notifications.filter(n => n.status_c === 'unread').length,
      read: notifications.filter(n => n.status_c === 'read').length,
      archived: notifications.filter(n => n.status_c === 'archived').length,
    };
    return counts;
  };

  const notificationCounts = getNotificationCounts();

  if (loading && notifications.length === 0) {
    return <Loading type="page" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadNotifications} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your notifications and stay updated
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedNotifications.length > 0 && (
            <Button
              onClick={handleBulkMarkAsRead}
              icon="Check"
              variant="outline"
            >
              Mark {selectedNotifications.length} as Read
            </Button>
          )}
          <Button
            onClick={loadNotifications}
            icon="RefreshCw"
            variant="ghost"
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Notification Overview */}
      <div className="flex flex-wrap gap-4">
        <Badge variant="primary">Unread: {notificationCounts.unread}</Badge>
        <Badge variant="secondary">Read: {notificationCounts.read}</Badge>
        <Badge variant="outline">Archived: {notificationCounts.archived}</Badge>
        <Badge variant="default">Total: {notifications.length}</Badge>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "All Statuses" },
                { value: "unread", label: "Unread" },
                { value: "read", label: "Read" },
                { value: "archived", label: "Archived" }
              ]}
              placeholder="All Statuses"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: "", label: "All Types" },
                { value: "email", label: "Email" },
                { value: "sms", label: "SMS" },
                { value: "push", label: "Push" }
              ]}
              placeholder="All Types"
            />
          </div>
          <div>
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {paginatedNotifications.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label className="ml-2 text-sm text-gray-700">
                Select all ({paginatedNotifications.length} items)
              </label>
            </div>
            {selectedNotifications.length > 0 && (
              <div className="text-sm text-gray-500">
                {selectedNotifications.length} selected
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {paginatedNotifications.length === 0 ? (
          <Empty
            title="No notifications found"
            description={filteredNotifications.length === 0 && notifications.length > 0 
              ? "Try adjusting your filters to see more notifications"
              : "You don't have any notifications yet"
            }
            actionLabel={filteredNotifications.length === 0 && notifications.length > 0 ? "Clear Filters" : undefined}
            onAction={filteredNotifications.length === 0 && notifications.length > 0 ? handleClearFilters : undefined}
            icon="Bell"
          />
        ) : (
          <>
            {paginatedNotifications.map((notification) => (
              <div key={notification.Id} className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.Id)}
                  onChange={() => handleSelectNotification(notification.Id)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary mt-4"
                />
                <div className="flex-1">
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAsArchived={handleMarkAsArchived}
                    onDelete={handleDelete}
                    showActions={true}
                  />
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredNotifications.length)} of {filteredNotifications.length} notifications
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon="ChevronLeft"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              icon="ChevronRight"
              iconPosition="right"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Notification"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this notification? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              icon="Trash2"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationsPage;