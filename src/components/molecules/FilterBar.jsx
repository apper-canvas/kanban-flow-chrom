import React from "react";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import SearchBar from "@/components/molecules/SearchBar";

const FilterBar = ({ 
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  assigneeFilter,
  onAssigneeChange,
  onClearFilters,
  users = [],
  showSearch = true,
  showStatus = true,
  showPriority = true,
  showAssignee = true,
  className
}) => {
  const statusOptions = [
    { value: "todo", label: "To Do" },
    { value: "in-progress", label: "In Progress" },
    { value: "done", label: "Done" }
  ];

  const priorityOptions = [
    { value: "high", label: "High Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "low", label: "Low Priority" }
  ];

  const assigneeOptions = users.map(user => ({
    value: user.Id.toString(),
    label: user.name
  }));

  const hasActiveFilters = statusFilter || priorityFilter || assigneeFilter || searchValue;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row gap-4">
        {showSearch && (
          <div className="flex-1">
            <SearchBar
              value={searchValue}
              onSearch={onSearchChange}
              placeholder="Search tasks..."
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          {showStatus && (
            <Select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              options={statusOptions}
              placeholder="All Status"
              className="min-w-[140px]"
            />
          )}
          {showPriority && (
            <Select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value)}
              options={priorityOptions}
              placeholder="All Priorities"
              className="min-w-[140px]"
            />
          )}
          {showAssignee && (
            <Select
              value={assigneeFilter}
              onChange={(e) => onAssigneeChange(e.target.value)}
              options={assigneeOptions}
              placeholder="All Assignees"
              className="min-w-[140px]"
            />
          )}
          {hasActiveFilters && onClearFilters && (
            <Button
              variant="ghost"
              onClick={onClearFilters}
              icon="X"
              size="sm"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;