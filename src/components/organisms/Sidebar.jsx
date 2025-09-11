import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose, className }) => {
  const location = useLocation();

const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Projects", href: "/projects", icon: "FolderOpen" },
{ name: "Tasks", href: "/kanban", icon: "Trello" },
{ name: "Team", href: "/team", icon: "Users" },
    { name: "Notifications", href: "/notifications", icon: "Bell" },
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <NavLink
        to={item.href}
        onClick={onClose}
        className={cn(
          "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative overflow-hidden",
          isActive
            ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
            : "text-gray-600 hover:text-primary hover:bg-primary/10"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-indicator"
            className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <div className="relative z-10 flex items-center">
          <ApperIcon 
            name={item.icon} 
            size={18} 
            className={cn(
              "mr-3 transition-transform duration-200 group-hover:scale-110",
              isActive ? "text-white" : "text-current"
            )} 
          />
          {item.name}
        </div>
      </NavLink>
    );
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <aside className={cn(
      "hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200",
      className
    )}>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center h-16 px-6 bg-gradient-to-r from-primary to-accent">
          <ApperIcon name="Trello" size={24} className="text-white mr-3" />
          <h1 className="text-xl font-bold text-white">Kanban Flow</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );

  // Mobile Sidebar Overlay
  const MobileSidebar = () => (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform lg:hidden",
          className
        )}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-primary to-accent">
            <div className="flex items-center">
              <ApperIcon name="Trello" size={24} className="text-white mr-3" />
              <h1 className="text-xl font-bold text-white">Kanban Flow</h1>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </motion.aside>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;