import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import SearchBar from "@/components/molecules/SearchBar";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import userService from "@/services/api/userService";
import taskService from "@/services/api/taskService";

const EmployeeModal = ({ isOpen, onClose, employee, onSave }) => {
  const [formData, setFormData] = useState({
    name_c: '',
    email_c: '',
    role_c: '',
    avatar_c: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name_c: employee.name_c || employee.Name || '',
        email_c: employee.email_c || '',
        role_c: employee.role_c || '',
        avatar_c: employee.avatar_c || ''
      });
    } else {
      setFormData({
        name_c: '',
        email_c: '',
        role_c: '',
        avatar_c: ''
      });
    }
  }, [employee, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name_c.trim() || !formData.email_c.trim()) {
      toast.error('Name and email are required');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (employee) {
        result = await userService.update(employee.Id, formData);
      } else {
        result = await userService.create(formData);
      }

      if (result) {
        onSave(result);
        onClose();
      }
    } catch (error) {
      toast.error('Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {employee ? 'Edit Employee' : 'Add Employee'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <ApperIcon name="X" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name_c"
              value={formData.name_c}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter full name"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email_c"
              value={formData.email_c}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter email address"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              name="role_c"
              value={formData.role_c}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter role"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL
            </label>
            <input
              type="text"
              name="avatar_c"
              value={formData.avatar_c}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter avatar URL"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary-dark text-white"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : (
                employee ? 'Update' : 'Add Employee'
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Team = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersData, tasksData] = await Promise.all([
        userService.getAll(),
        taskService.getAll()
      ]);
      
      // Enrich users with task statistics
const enrichedUsers = usersData.map(user => {
        const userTasks = tasksData.filter(task => (task.assignee_id_c?.Id || task.assignee_id_c) === user.Id);
        const completedTasks = userTasks.filter(task => task.status_c === "done");
        const inProgressTasks = userTasks.filter(task => task.status_c === "in-progress");
        const overdueTasks = userTasks.filter(task => 
          new Date(task.due_date_c) < new Date() && task.status_c !== "done"
        );

        return {
          ...user,
          statistics: {
            totalTasks: userTasks.length,
            completedTasks: completedTasks.length,
            inProgressTasks: inProgressTasks.length,
            overdueTasks: overdueTasks.length,
            completionRate: userTasks.length > 0 
              ? Math.round((completedTasks.length / userTasks.length) * 100) 
              : 0
          }
        };
      });
      
      setUsers(enrichedUsers);
      setTasks(tasksData);
      setFilteredUsers(enrichedUsers);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
(user.name_c || user.Name || '').toLowerCase().includes(searchLower) ||
      (user.email_c || '').toLowerCase().includes(searchLower) ||
      (user.role_c || '').toLowerCase().includes(searchLower)
    );

    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const handleInviteUser = () => {
    toast.info("User invitation feature would open here");
  };

  const getWorkloadColor = (completionRate) => {
    if (completionRate >= 80) return "success";
    if (completionRate >= 60) return "primary";
    if (completionRate >= 40) return "warning";
    return "error";
  };

  const getWorkloadLabel = (stats) => {
    const { inProgressTasks, overdueTasks } = stats;
    const activeLoad = inProgressTasks + overdueTasks;
    
    if (activeLoad === 0) return "Available";
    if (activeLoad <= 2) return "Light";
    if (activeLoad <= 4) return "Moderate";
    return "Heavy";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
Employees & Contacts
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your team members and their contact information.
          </p>
        </div>
        <Button
          onClick={handleInviteUser}
          icon="UserPlus"
          size="lg"
        >
          Invite User
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={searchTerm}
          onSearch={setSearchTerm}
placeholder="Search employees..."
        />
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="text-center">
<p className="text-2xl font-bold text-primary">{users.length}</p>
            <p className="text-sm text-gray-600">Total Employees</p>
          </div>
        </Card>
        <Card padding="md">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">
              {users.filter(u => getWorkloadLabel(u.statistics) === "Available").length}
            </p>
            <p className="text-sm text-gray-600">Available</p>
          </div>
        </Card>
        <Card padding="md">
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">
              {users.filter(u => ["Light", "Moderate"].includes(getWorkloadLabel(u.statistics))).length}
            </p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
        </Card>
        <Card padding="md">
          <div className="text-center">
            <p className="text-2xl font-bold text-error">
              {users.filter(u => getWorkloadLabel(u.statistics) === "Heavy").length}
            </p>
            <p className="text-sm text-gray-600">Busy</p>
          </div>
        </Card>
      </div>

      {/* Team Members Grid */}
      {filteredUsers.length === 0 ? (
        <Empty
title={users.length === 0 ? "No Employees" : "No Employees Found"}
          description={
            users.length === 0 
              ? "Add your first employee to start managing your team" 
              : "Try adjusting your search to find employees"
          }
          actionLabel={users.length === 0 ? "Add First Employee" : "Clear Search"}
          onAction={users.length === 0 ? handleAddEmployee : () => setSearchTerm("")}
          icon="Users"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="group">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar
src={user.avatar_c}
                    name={user.name_c || user.Name}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {user.name_c || user.Name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">{user.role_c}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email_c}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Workload Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Workload</span>
                    <Badge variant={getWorkloadColor(user.statistics.completionRate)}>
                      {getWorkloadLabel(user.statistics)}
                    </Badge>
                  </div>

                  {/* Task Statistics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-1">
                        <ApperIcon name="CheckSquare" size={14} className="text-success" />
                        <span className="text-gray-600">Completed</span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {user.statistics.completedTasks}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <ApperIcon name="Clock" size={14} className="text-info" />
                        <span className="text-gray-600">In Progress</span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {user.statistics.inProgressTasks}
                      </p>
                    </div>
                  </div>

                  {/* Completion Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.statistics.completionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${
                          user.statistics.completionRate >= 80 
                            ? "from-success to-green-600"
                            : user.statistics.completionRate >= 60
                            ? "from-primary to-accent"
                            : "from-warning to-yellow-600"
                        }`}
                        style={{ width: `${user.statistics.completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Overdue Tasks Warning */}
                  {user.statistics.overdueTasks > 0 && (
                    <div className="flex items-center space-x-2 p-2 bg-error/10 rounded-lg">
                      <ApperIcon name="AlertTriangle" size={16} className="text-error" />
                      <span className="text-sm text-error font-medium">
                        {user.statistics.overdueTasks} overdue task{user.statistics.overdueTasks > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
</div>
  );
};

const TeamPage = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Define activeUsers based on user statistics
  const activeUsers = users.filter(user => 
    user.statistics && (user.statistics.inProgressTasks > 0 || user.statistics.completedTasks > 0)
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersData, tasksData] = await Promise.all([
        userService.getAll(),
        taskService.getAll()
      ]);
      
      // Enrich users with task statistics
      const enrichedUsers = usersData.map(user => {
        const userTasks = tasksData.filter(task => (task.assignee_id_c?.Id || task.assignee_id_c) === user.Id);
        const completedTasks = userTasks.filter(task => task.status_c === "done");
        const inProgressTasks = userTasks.filter(task => task.status_c === "in-progress");
        const overdueTasks = userTasks.filter(task => 
          new Date(task.due_date_c) < new Date() && task.status_c !== "done"
        );

        return {
          ...user,
          statistics: {
            totalTasks: userTasks.length,
            completedTasks: completedTasks.length,
            inProgressTasks: inProgressTasks.length,
            overdueTasks: overdueTasks.length,
            completionRate: userTasks.length > 0 
              ? Math.round((completedTasks.length / userTasks.length) * 100) 
              : 0
          }
        };
      });
      
      setUsers(enrichedUsers);
      setTasks(tasksData);
      setFilteredUsers(enrichedUsers);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      (user.name_c || user.Name || '').toLowerCase().includes(searchLower) ||
      (user.email_c || '').toLowerCase().includes(searchLower) ||
      (user.role_c || '').toLowerCase().includes(searchLower)
    );

    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setModalOpen(true);
  };

  const handleDeleteEmployee = async (employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.name_c || employee.Name}?`)) {
      try {
        const success = await userService.delete(employee.Id);
        if (success) {
          setUsers(prev => prev.filter(u => u.Id !== employee.Id));
          toast.success('Employee deleted successfully');
        }
      } catch (error) {
        toast.error('Failed to delete employee');
      }
    }
  };

  const handleSaveEmployee = (savedEmployee) => {
    if (editingEmployee) {
      setUsers(prev => prev.map(u => u.Id === savedEmployee.Id ? savedEmployee : u));
      toast.success('Employee updated successfully');
    } else {
      setUsers(prev => [...prev, savedEmployee]);
      toast.success('Employee added successfully');
    }
    loadData(); // Refresh to get updated statistics
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Employees & Contacts
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your team members and their contact information.
          </p>
        </div>
        <Button 
          onClick={handleAddEmployee}
          className="bg-primary hover:bg-primary-dark text-white"
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar 
            value={searchTerm}
            onSearch={setSearchTerm}
            placeholder="Search employees..."
            className="w-full"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">{users.length}</p>
              <p className="text-sm text-gray-600">Total Employees</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
              <ApperIcon name="Users" size={24} className="text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-accent">{activeUsers.length}</p>
              <p className="text-sm text-gray-600">Active Members</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg">
              <ApperIcon name="UserCheck" size={24} className="text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">{Math.round((activeUsers.length / Math.max(users.length, 1)) * 100)}%</p>
              <p className="text-sm text-gray-600">Engagement Rate</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg">
              <ApperIcon name="TrendingUp" size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Employee List */}
      {filteredUsers.length === 0 ? (
        <Empty 
          title={users.length === 0 ? "No Employees" : "No Employees Found"}
          description={
            users.length === 0 
              ? "Add your first employee to start managing your team" 
              : "Try adjusting your search to find employees"
          }
          actionLabel={users.length === 0 ? "Add First Employee" : "Clear Search"}
          onAction={users.length === 0 ? handleAddEmployee : () => setSearchTerm("")}
          icon="Users"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6 hover-lift cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar 
                      src={user.avatar_c} 
                      name={user.name_c || user.Name}
                      size="md"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.name_c || user.Name}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email_c}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEmployee(user);
                      }}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Edit" size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEmployee(user);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {user.role_c && (
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Briefcase" size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{user.role_c}</span>
                    </div>
                  )}
                  
                  {user.Tags && (
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Tag" size={14} className="text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {user.Tags.split(',').map((tag, tagIndex) => (
                          <Badge 
                            key={tagIndex} 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {user.CreatedOn && (
                      <span>
                        Added {new Date(user.CreatedOn).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <Badge 
                    variant={user.role_c ? "primary" : "secondary"}
                    className="text-xs"
                  >
                    {user.role_c || 'No Role'}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={editingEmployee}
        onSave={handleSaveEmployee}
      />
    </div>
  );
};

export default TeamPage;
export default Team;