import React, { useContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import NotificationPanel from "@/components/molecules/NotificationPanel";
import { AuthContext } from "../../App";
import notificationService from "@/services/api/notificationService";
import { setUnreadCount } from "@/store/notificationSlice";
const Header = ({ onMenuClick, title, className }) => {
const { logout } = useContext(AuthContext);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { unreadCount } = useSelector((state) => state.notifications);
  
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      loadUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.userId]);

  const loadUnreadCount = async () => {
    if (user?.userId) {
      try {
        const count = await notificationService.getUnreadCount(user.userId);
        dispatch(setUnreadCount(count));
      } catch (error) {
        console.error("Error loading unread count:", error);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleNotificationClick = () => {
    setNotificationPanelOpen(!notificationPanelOpen);
  };
  return (
    <header className={cn(
      "bg-white border-b border-gray-200 lg:ml-64 sticky top-0 z-30",
      className
    )}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              icon="Menu"
              onClick={onMenuClick}
              className="lg:hidden mr-2"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {title || "Dashboard"}
              </h1>
            </div>
          </div>

<div className="flex items-center space-x-4">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                icon="Bell"
                onClick={handleNotificationClick}
                className="relative"
              />
              {unreadCount > 0 && (
                <Badge 
                  variant="error" 
                  size="sm" 
                  className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs px-1"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
              <NotificationPanel
                isOpen={notificationPanelOpen}
                onClose={() => setNotificationPanelOpen(false)}
              />
            </div>
            <Button variant="ghost" size="sm" icon="Settings" />
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <Avatar 
                name={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.emailAddress || "User"} 
                size="md" 
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.emailAddress || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.accounts?.[0]?.companyName || "Team Member"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon="LogOut"
                onClick={handleLogout}
                className="ml-2"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;