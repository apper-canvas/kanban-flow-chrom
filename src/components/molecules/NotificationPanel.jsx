import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import notificationService from "@/services/api/notificationService";
import { setNotifications, setUnreadCount, markAsRead, setLoading, setError } from "@/store/notificationSlice";
import { formatDistanceToNow } from "date-fns";

const NotificationPanel = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.user);
  
  // Show recent notifications (last 10)
  const recentNotifications = notifications.slice(0, 10);

  useEffect(() => {
    if (isOpen && user) {
      loadNotifications();
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  const loadNotifications = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getAll({ 
          recipientId: user.userId,
          limit: 20 
        }),
        notificationService.getUnreadCount(user.userId)
      ]);
      
      dispatch(setNotifications(notificationsData));
      dispatch(setUnreadCount(unreadCountData));
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.status_c === 'unread') {
      try {
        await notificationService.markAsRead(notification.Id);
        dispatch(markAsRead(notification.Id));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const handleViewAll = () => {
    navigate("/notifications");
    onClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'email':
        return 'Mail';
      case 'sms':
        return 'MessageSquare';
      case 'push':
      default:
        return 'Bell';
    }
  };

  const getNotificationBadgeVariant = (type) => {
    switch (type) {
      case 'email':
        return 'info';
      case 'sms':
        return 'warning';
      case 'push':
      default:
        return 'primary';
    }
  };

  const formatNotificationTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="error" size="sm" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon="X"
              onClick={onClose}
              className="-mr-2"
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-6 text-center">
                <ApperIcon name="Bell" size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="py-2">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.Id}
                    className={cn(
                      "flex items-start p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0",
                      notification.status_c === 'unread' && "bg-primary/5"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        notification.status_c === 'unread' ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                      )}>
                        <ApperIcon 
                          name={getNotificationIcon(notification.notification_type_c)} 
                          size={14} 
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={cn(
                            "text-sm truncate",
                            notification.status_c === 'unread' ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                          )}>
                            {notification.subject_c || "Notification"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {notification.message_c}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatNotificationTime(notification.sent_at_c)}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <Badge 
                            variant={getNotificationBadgeVariant(notification.notification_type_c)} 
                            size="sm"
                          >
                            {notification.notification_type_c}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="ghost"
                className="w-full justify-center"
                onClick={handleViewAll}
                icon="ArrowRight"
                iconPosition="right"
              >
                View All Notifications
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;