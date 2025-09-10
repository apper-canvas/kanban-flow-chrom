import React, { useMemo } from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";
import { format, differenceInDays, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";

const GanttChart = ({ tasks = [], users = [], projects = [], loading = false }) => {
  const ganttData = useMemo(() => {
    if (!tasks.length) return { chartTasks: [], weeks: [], startDate: new Date(), endDate: new Date() };

    const taskDates = tasks.map(task => ({
      start: parseISO(task.createdAt),
      end: parseISO(task.dueDate)
    }));

    const allDates = taskDates.flatMap(({ start, end }) => [start, end]);
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));

    const startDate = startOfWeek(minDate);
    const endDate = new Date(maxDate);
    endDate.setDate(endDate.getDate() + 7);

    const totalDays = differenceInDays(endDate, startDate);
    const weeks = [];
    
    for (let i = 0; i < Math.ceil(totalDays / 7); i++) {
      const weekStart = addDays(startDate, i * 7);
      weeks.push(weekStart);
    }

    const chartTasks = tasks.map(task => {
      const taskStart = parseISO(task.createdAt);
      const taskEnd = parseISO(task.dueDate);
      const startOffset = differenceInDays(taskStart, startDate);
      const duration = differenceInDays(taskEnd, taskStart) + 1;
      
      return {
        ...task,
        startOffset: Math.max(0, startOffset),
        duration: Math.max(1, duration),
        assignee: users.find(user => user.Id.toString() === task.assigneeId?.toString())
      };
    });

    return { chartTasks, weeks, startDate, endDate };
  }, [tasks, users]);

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-gradient-to-r from-red-500 to-red-600",
      medium: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      low: "bg-gradient-to-r from-green-500 to-green-600"
    };
    return colors[priority] || "bg-gradient-to-r from-gray-500 to-gray-600";
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: "border-l-gray-500",
      "in-progress": "border-l-blue-500",
      done: "border-l-green-500"
    };
    return colors[status] || "border-l-gray-500";
  };

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-48 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!ganttData.chartTasks.length) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <ApperIcon name="Calendar" size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Timeline Data</h3>
          <p className="text-gray-500">Create some tasks to see the project timeline</p>
        </div>
      </Card>
    );
  }

  const { chartTasks, weeks, startDate } = ganttData;

  return (
    <Card padding="none">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded"></div>
              <span>Medium Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
              <span>Low Priority</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px] p-6">
          {/* Timeline Header */}
          <div className="flex mb-6">
            <div className="w-64 flex-shrink-0"></div>
            <div className="flex-1 grid grid-cols-[repeat(var(--weeks),_minmax(0,_1fr))] gap-1" style={{"--weeks": weeks.length}}>
              {weeks.map((week, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs font-medium text-gray-900">
                    {format(week, "MMM d")}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(week, "yyyy")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            {chartTasks.map((task, index) => (
              <div key={task.Id} className="flex items-center group">
                {/* Task Info */}
                <div className="w-64 flex-shrink-0 pr-4">
                  <div className={`p-3 rounded-lg border-l-4 bg-gray-50 group-hover:bg-gray-100 transition-colors ${getStatusColor(task.status)}`}>
                    <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">
                      {task.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <Badge variant={task.priority === "high" ? "error" : task.priority === "medium" ? "warning" : "success"} size="sm">
                        {task.priority}
                      </Badge>
                      {task.assignee && (
                        <Avatar name={task.assignee.name} size="sm" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline Bar */}
                <div className="flex-1 relative h-12">
                  <div className="absolute inset-y-0 grid grid-cols-[repeat(var(--weeks),_minmax(0,_1fr))] gap-1 w-full" style={{"--weeks": weeks.length}}>
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="border-r border-gray-100 last:border-r-0"></div>
                    ))}
                  </div>
                  
                  {/* Task Bar */}
                  <div
                    className={`absolute top-2 bottom-2 rounded-md shadow-sm ${getPriorityColor(task.priority)} opacity-80 hover:opacity-100 transition-opacity`}
                    style={{
                      left: `${(task.startOffset / (weeks.length * 7)) * 100}%`,
                      width: `${(task.duration / (weeks.length * 7)) * 100}%`,
                      minWidth: "20px"
                    }}
                  >
                    <div className="h-full flex items-center px-2">
                      <span className="text-xs text-white font-medium truncate">
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GanttChart;