import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import KanbanBoard from "@/components/organisms/KanbanBoard";
import TaskModal from "@/components/organisms/TaskModal";
import FilterBar from "@/components/molecules/FilterBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import taskService from "@/services/api/taskService";
import projectService from "@/services/api/projectService";
import userService from "@/services/api/userService";
import { toast } from "react-toastify";

const KanbanBoardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [selectedProject, setSelectedProject] = useState(searchParams.get("project") || "");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  
  // Modal states
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isNewTask, setIsNewTask] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState("todo");

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

    // Apply project filter
    if (selectedProject) {
      filtered = filtered.filter(task => task.projectId === parseInt(selectedProject));
    }

    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter) {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Apply assignee filter
    if (assigneeFilter) {
      filtered = filtered.filter(task => task.assigneeId === parseInt(assigneeFilter));
    }

    setFilteredTasks(filtered);
  }, [tasks, selectedProject, searchValue, statusFilter, priorityFilter, assigneeFilter]);

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    
    // Update URL params
    if (projectId) {
      setSearchParams({ project: projectId });
    } else {
      setSearchParams({});
    }
  };

  const handleTaskCreate = (status = "todo") => {
    setNewTaskStatus(status);
    setSelectedTask(null);
    setIsNewTask(true);
    setIsTaskModalOpen(true);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsNewTask(false);
    setIsTaskModalOpen(true);
  };

  const handleTaskSave = async (taskData) => {
    try {
      if (isNewTask) {
        const newTaskData = {
          ...taskData,
          status: newTaskStatus,
          projectId: selectedProject ? parseInt(selectedProject) : 1 // Default project
        };
        const createdTask = await taskService.create(newTaskData);
        setTasks(prev => [...prev, createdTask]);
      } else {
        const updatedTask = await taskService.update(selectedTask.Id, taskData);
        setTasks(prev => prev.map(task => 
          task.Id === selectedTask.Id ? updatedTask : task
        ));
      }
      
      setIsTaskModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleTaskUpdate = async (taskId, taskData) => {
    try {
      const updatedTask = await taskService.update(taskId, taskData);
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? updatedTask : task
      ));
    } catch (error) {
      throw error;
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
      setIsTaskModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setStatusFilter("");
    setPriorityFilter("");
    setAssigneeFilter("");
  };

  const selectedProjectData = projects.find(p => p.Id.toString() === selectedProject);
  const projectOptions = projects.map(project => ({
    value: project.Id.toString(),
    label: project.name
  }));

  const getTaskCounts = () => {
    const counts = {
      todo: filteredTasks.filter(t => t.status === "todo").length,
      "in-progress": filteredTasks.filter(t => t.status === "in-progress").length,
      done: filteredTasks.filter(t => t.status === "done").length
    };
    return counts;
  };

  const taskCounts = getTaskCounts();

  if (loading) {
    return <Loading type="kanban" />;
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
            Kanban Board
          </h1>
          {selectedProjectData && (
            <p className="text-gray-600 mt-1">
              {selectedProjectData.name}
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
            onClick={() => handleTaskCreate()}
            icon="Plus"
            size="lg"
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Task Overview */}
      <div className="flex flex-wrap gap-4">
        <Badge variant="secondary">To Do: {taskCounts.todo}</Badge>
        <Badge variant="info">In Progress: {taskCounts["in-progress"]}</Badge>
        <Badge variant="success">Done: {taskCounts.done}</Badge>
        <Badge variant="default">Total: {filteredTasks.length}</Badge>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        assigneeFilter={assigneeFilter}
        onAssigneeChange={setAssigneeFilter}
        onClearFilters={handleClearFilters}
        users={users}
        showSearch={true}
        showStatus={true}
        showPriority={true}
        showAssignee={true}
      />

      {/* Kanban Board */}
      {filteredTasks.length === 0 && !selectedProject ? (
        <Empty
          title="Select a Project"
          description="Choose a project from the dropdown above to view its tasks on the Kanban board"
          actionLabel="Create First Task"
          onAction={() => handleTaskCreate()}
          icon="Trello"
        />
      ) : (
        <KanbanBoard
          tasks={filteredTasks}
          users={users}
          onTaskUpdate={handleTaskUpdate}
          onTaskClick={handleTaskClick}
          onTaskCreate={handleTaskCreate}
          loading={loading}
        />
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
        users={users}
        isNew={isNewTask}
      />
    </div>
  );
};

export default KanbanBoardPage;