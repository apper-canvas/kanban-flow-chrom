import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Card from "@/components/atoms/Card";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";
import userService from "@/services/api/userService";
import taskService from "@/services/api/taskService";
import { toast } from "react-toastify";

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
        const userTasks = tasksData.filter(task => task.assigneeId === user.Id);
        const completedTasks = userTasks.filter(task => task.status === "done");
        const inProgressTasks = userTasks.filter(task => task.status === "in-progress");
        const overdueTasks = userTasks.filter(task => 
          new Date(task.dueDate) < new Date() && task.status !== "done"
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
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
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
            Team Members
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your team and track their progress across projects.
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
          placeholder="Search team members..."
        />
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{users.length}</p>
            <p className="text-sm text-gray-600">Total Members</p>
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
          title={users.length === 0 ? "No Team Members" : "No Members Found"}
          description={
            users.length === 0 
              ? "Invite team members to start collaborating on projects" 
              : "Try adjusting your search to find team members"
          }
          actionLabel={users.length === 0 ? "Invite First Member" : "Clear Search"}
          onAction={users.length === 0 ? handleInviteUser : () => setSearchTerm("")}
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
                    src={user.avatar}
                    name={user.name}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">{user.role}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
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

export default Team;