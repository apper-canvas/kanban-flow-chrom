import React, { useState, useEffect } from "react";
import ProjectGrid from "@/components/organisms/ProjectGrid";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import projectService from "@/services/api/projectService";
import { toast } from "react-toastify";

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

  const handleCreateProject = () => {
    toast.info("Project creation feature would open here");
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
    </div>
  );
};

export default Projects;