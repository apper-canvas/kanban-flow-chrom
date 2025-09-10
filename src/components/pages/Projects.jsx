import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Modal from "@/components/molecules/Modal";
import SearchBar from "@/components/molecules/SearchBar";
import Badge from "@/components/atoms/Badge";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ProjectGrid from "@/components/organisms/ProjectGrid";
import Team from "@/components/pages/Team";
import projectService from "@/services/api/projectService";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getAll();
      setProjects(data);
      setFilteredProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    let filtered = [...projects];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
(project.name_c || project.Name || '').toLowerCase().includes(searchLower) ||
        (project.description_c || '').toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter) {
filtered = filtered.filter(project => project.status_c === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
return (a.name_c || a.Name || '').localeCompare(b.name_c || b.Name || '');
        case "dueDate":
          return new Date(a.due_date_c) - new Date(b.due_date_c);
        case "progress":
          return (b.progress_c || 0) - (a.progress_c || 0);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, sortBy]);

// Modal and form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name_c: "",
    description_c: "",
    status_c: "active",
    due_date_c: "",
    team_members_c: "",
    progress_c: 0
  });

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateSubmit = async () => {
    if (!formData.name_c.trim()) {
      toast.error("Project name is required");
      return;
    }

    setCreateLoading(true);
    try {
      const result = await projectService.create({
        ...formData,
        Name: formData.name_c // Also set the Name field
      });

      if (result) {
        toast.success("Project created successfully!");
        setShowCreateModal(false);
        setFormData({
          name_c: "",
          description_c: "",
          status_c: "active",
          due_date_c: "",
          team_members_c: "",
          progress_c: 0
        });
        loadProjects(); // Refresh the projects list
      }
    } catch (error) {
      toast.error("Failed to create project");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateCancel = () => {
    setShowCreateModal(false);
    setFormData({
      name_c: "",
      description_c: "",
      status_c: "active",
      due_date_c: "",
      team_members_c: "",
      progress_c: 0
    });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setSortBy("name");
  };

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "on_hold", label: "On Hold" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "dueDate", label: "Due Date" },
    { value: "progress", label: "Progress" },
    { value: "status", label: "Status" }
  ];

  const getStatusCounts = () => {
    const counts = {};
projects.forEach(project => {
      counts[project.status_c] = (counts[project.status_c] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const hasActiveFilters = searchTerm || statusFilter || sortBy !== "name";

  if (loading) {
    return <Loading type="dashboard" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadProjects} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your projects in one place.
          </p>
        </div>
        <Button
          onClick={handleCreateProject}
          icon="Plus"
          size="lg"
        >
          New Project
        </Button>
      </div>

      {/* Status Overview */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Badge variant="success">Active: {statusCounts.active || 0}</Badge>
          <Badge variant="primary">Completed: {statusCounts.completed || 0}</Badge>
          <Badge variant="warning">On Hold: {statusCounts.on_hold || 0}</Badge>
          <Badge variant="error">Cancelled: {statusCounts.cancelled || 0}</Badge>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onSearch={setSearchTerm}
            placeholder="Search projects by name or description..."
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
            placeholder="All Status"
            className="min-w-[140px]"
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={sortOptions}
            placeholder="Sort by"
            className="min-w-[120px]"
          />
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              icon="X"
              size="sm"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredProjects.length} of {projects.length} projects
        </p>
      </div>

{/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Empty
          title={projects.length === 0 ? "No Projects Yet" : "No Projects Found"}
          description={
            projects.length === 0 
              ? "Get started by creating your first project to organize your team's work" 
              : "Try adjusting your search or filters to find what you're looking for"
          }
          actionLabel={projects.length === 0 ? "Create First Project" : "Clear Filters"}
          onAction={projects.length === 0 ? handleCreateProject : handleClearFilters}
          icon="FolderOpen"
        />
      ) : (
        <ProjectGrid projects={filteredProjects} loading={loading} />
      )}
      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={handleCreateCancel}
        title="Create New Project"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name_c}
              onChange={(e) => handleFormChange("name_c", e.target.value)}
              placeholder="Enter project name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              disabled={createLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description_c}
              onChange={(e) => handleFormChange("description_c", e.target.value)}
              placeholder="Enter project description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              disabled={createLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status_c}
                onChange={(e) => handleFormChange("status_c", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                disabled={createLoading}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={formData.due_date_c}
                onChange={(e) => handleFormChange("due_date_c", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                disabled={createLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Members
              </label>
              <input
                type="text"
                value={formData.team_members_c}
                onChange={(e) => handleFormChange("team_members_c", e.target.value)}
                placeholder="Team member names"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                disabled={createLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress_c}
                onChange={(e) => handleFormChange("progress_c", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                disabled={createLoading}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={handleCreateCancel}
            disabled={createLoading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateSubmit}
            disabled={createLoading}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center space-x-2"
          >
            {createLoading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            )}
            <span>{createLoading ? "Creating..." : "Create Project"}</span>
          </button>
</div>
      </Modal>
    </div>
  );
};

export default Projects;