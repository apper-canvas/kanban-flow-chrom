import React from "react";
import { cn } from "@/utils/cn";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { formatDistanceToNow, format } from "date-fns";

const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onMarkAsArchived, 
  onDelete, 
  compact = false,
  showActions = true 
}) => {
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

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'unread':
        return 'primary';
      case 'read':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'default';
    }
  };

  const formatNotificationTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return compact 
        ? formatDistanceToNow(date, { addSuffix: true })
        : format(date, "MMM d, yyyy 'at' h:mm a");
    } catch {
      return 'Recently';
    }
  };

  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    onMarkAsRead?.(notification.Id);
  };

  const handleMarkAsArchived = (e) => {
    e.stopPropagation();
    onMarkAsArchived?.(notification.Id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(notification.Id);
  };

  return (
    <div className={cn(
      "flex items-start p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200",
      notification.status_c === 'unread' && "bg-primary/5 border-primary/20",
      compact && "p-3"
    )}>
      <div className="flex-shrink-0 mr-3 mt-1">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          notification.status_c === 'unread' 
            ? "bg-gradient-to-r from-primary to-accent text-white shadow-sm" 
            : "bg-gray-200 text-gray-600",
          compact && "w-8 h-8"
        )}>
          <ApperIcon 
            name={getNotificationIcon(notification.notification_type_c)} 
            size={compact ? 14 : 16} 
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className={cn(
              "font-semibold text-gray-900 truncate",
              compact ? "text-sm" : "text-base",
              notification.status_c !== 'unread' && "font-medium text-gray-700"
            )}>
              {notification.subject_c || "Notification"}
            </h4>
            <div className="flex items-center mt-1 space-x-2">
              <Badge 
                variant={getNotificationBadgeVariant(notification.notification_type_c)} 
                size="sm"
              >
                {notification.notification_type_c}
              </Badge>
              <Badge 
                variant={getStatusBadgeVariant(notification.status_c)} 
                size="sm"
              >
                {notification.status_c}
              </Badge>
              {notification.status_c === 'unread' && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-1 ml-2">
              {notification.status_c === 'unread' && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="Check"
                  onClick={handleMarkAsRead}
                  title="Mark as read"
                />
              )}
              {notification.status_c !== 'archived' && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="Archive"
                  onClick={handleMarkAsArchived}
                  title="Archive"
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                icon="Trash2"
                onClick={handleDelete}
                title="Delete"
              />
            </div>
          )}
        </div>

        <div className="mb-2">
          <p className={cn(
            "text-gray-600 leading-relaxed",
            compact ? "text-sm line-clamp-2" : "text-sm"
          )}>
            {notification.message_c}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatNotificationTime(notification.sent_at_c)}</span>
          {notification.recipient_id_c?.Name && (
            <span>To: {notification.recipient_id_c.Name}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;