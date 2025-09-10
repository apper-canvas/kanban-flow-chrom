import React, { useState, useEffect } from "react";
import StatsCards from "@/components/organisms/StatsCards";
import ProjectGrid from "@/components/organisms/ProjectGrid";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import projectService from "@/services/api/projectService";
import taskService from "@/services/api/taskService";
import userService from "@/services/api/userService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projectsData, projectStats, taskStats, tasksData, users] = await Promise.all([
        projectService.getAll(),
        projectService.getProjectStats(),
        taskService.getTaskStats(),
        taskService.getAll(),
        userService.getAll()
      ]);

      // Get recent tasks (last 5)
const sortedTasks = tasksData.sort((a, b) => new Date(b.created_at_c) - new Date(a.created_at_c));
      const recent = sortedTasks.slice(0, 5).map(task => ({
        ...task,
        assignee: users.find(u => u.Id === (task.assignee_id_c?.Id || task.assignee_id_c))
      }));

      setProjects(projectsData.slice(0, 6)); // Show first 6 projects
      setRecentTasks(recent);
      
      // Combine stats
      setStats([
        { 
          title: "Total Projects", 
          value: projectStats.totalProjects.toString(), 
          change: "+12%", 
          trend: "up", 
          icon: "FolderOpen",
          color: "from-blue-500 to-blue-600"
        },
        { 
title: "Active Tasks", 
          value: taskStats.inProgressTasks.toString(),
          change: "+8%", 
          trend: "up", 
          icon: "CheckSquare",
          color: "from-green-500 to-green-600"
        },
        { 
          title: "Team Members", 
          value: users.length.toString(), 
          change: "+2%", 
          trend: "up", 
          icon: "Users",
          color: "from-purple-500 to-purple-600"
        }
      ]);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <Loading type="dashboard" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Project Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
        <Button
          onClick={() => navigate("/projects")}
          icon="Plus"
          size="lg"
        >
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Projects Section */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            <Button
              variant="ghost"
              onClick={() => navigate("/projects")}
              icon="ArrowRight"
              iconPosition="right"
            >
              View All
            </Button>
          </div>
          
          {projects.length === 0 ? (
            <Empty
              title="No Projects Yet"
              description="Get started by creating your first project"
              actionLabel="Create Project"
              onAction={() => navigate("/projects")}
              icon="FolderOpen"
            />
          ) : (
            <ProjectGrid projects={projects} />
          )}
        </div>

        {/* Recent Activity Sidebar */}
        <div className="space-y-6">
          {/* Recent Tasks */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/kanban")}
                icon="ArrowRight"
                iconPosition="right"
              >
                View Board
              </Button>
            </div>
            
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="CheckSquare" size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No recent tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.Id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/kanban?task=${task.Id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
{task.title_c || task.Name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {task.status.replace("-", " ")} • {task.priority} priority
                      </p>
                    </div>
{task.assignee && (
                      <div className="ml-3 flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                          {(task.assignee.name_c || task.assignee.Name)?.charAt(0)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                icon="Plus"
                onClick={() => navigate("/projects")}
              >
                Create New Project
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                icon="CheckSquare"
                onClick={() => navigate("/kanban")}
              >
                Add Task
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                icon="Users"
                onClick={() => navigate("/team")}
              >
                Manage Team
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                icon="Calendar"
                onClick={() => navigate("/gantt")}
              >
                View Timeline
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;