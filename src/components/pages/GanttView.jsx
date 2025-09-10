import React, { useState, useEffect } from "react";
import GanttChart from "@/components/organisms/GanttChart";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import taskService from "@/services/api/taskService";
import projectService from "@/services/api/projectService";
import userService from "@/services/api/userService";
import { useNavigate } from "react-router-dom";

const GanttView = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tasksData, projectsData, usersData] = await Promise.all([
        taskService.getAll(),
        projectService.getAll(),
        userService.getAll()
      ]);
      
      setTasks(tasksData);
      setProjects(projectsData);
      setUsers(usersData);
      
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
    let filtered = [...tasks];

if (selectedProject) {
      filtered = filtered.filter(task => task.projectId === parseInt(selectedProject));
    }

    // Sort by due date for better timeline visualization
filtered.sort((a, b) => new Date(a.due_date_c) - new Date(b.due_date_c));

    setFilteredTasks(filtered);
  }, [tasks, selectedProject]);

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  const handleCreateTask = () => {
    navigate("/kanban");
  };

  const selectedProjectData = projects.find(p => p.Id.toString() === selectedProject);
const projectOptions = projects.map(project => ({
    value: project.Id.toString(),
    label: project.name_c || project.Name
  }));

  const getTaskStatistics = () => {
    if (!filteredTasks.length) return null;

const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.status_c === "done").length;
    const inProgressTasks = filteredTasks.filter(t => t.status_c === "in-progress").length;
    const overdueTasks = filteredTasks.filter(t => 
      new Date(t.due_date_c) < new Date() && t.status_c !== "done"
    ).length;

    return {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      overdue: overdueTasks,
      completionRate: Math.round((completedTasks / totalTasks) * 100)
    };
  };

  const statistics = getTaskStatistics();

  if (loading) {
    return <Loading type="gantt" />;
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
            Gantt Timeline
          </h1>
          <p className="text-gray-600 mt-1">
            Visualize project timelines and task dependencies
          </p>
          {selectedProjectData && (
<p className="text-sm text-gray-500 mt-1">
              Viewing: {selectedProjectData.name_c || selectedProjectData.Name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedProject}
            onChange={handleProjectChange}
            options={projectOptions}
            placeholder="All Projects"
            className="min-w-[200px]"
          />
          <Button
            onClick={handleCreateTask}
            icon="Plus"
            size="lg"
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="flex flex-wrap gap-4">
          <Badge variant="default">Total: {statistics.total}</Badge>
          <Badge variant="success">Completed: {statistics.completed}</Badge>
          <Badge variant="info">In Progress: {statistics.inProgress}</Badge>
          {statistics.overdue > 0 && (
            <Badge variant="error">Overdue: {statistics.overdue}</Badge>
          )}
          <Badge variant="primary">Completion: {statistics.completionRate}%</Badge>
        </div>
      )}

      {/* Gantt Chart */}
      {filteredTasks.length === 0 ? (
        <Empty
          title={selectedProject ? "No Tasks in Project" : "Select a Project"}
          description={
            selectedProject 
              ? "This project doesn't have any tasks yet. Create some tasks to see them on the timeline."
              : "Choose a project from the dropdown above to view its timeline, or view all tasks together."
          }
          actionLabel="Create First Task"
          onAction={handleCreateTask}
          icon="Calendar"
        />
      ) : (
        <GanttChart
          tasks={filteredTasks}
          users={users}
          projects={projects}
          loading={loading}
        />
      )}
    </div>
  );
};

export default GanttView;