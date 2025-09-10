import tasksData from "@/services/mockData/tasks.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class TaskService {
  constructor() {
    this.tasks = [...tasksData];
  }

  async getAll(filters = {}) {
    await delay(300);
    let filteredTasks = [...this.tasks];

    if (filters.projectId) {
      filteredTasks = filteredTasks.filter(t => t.projectId === parseInt(filters.projectId));
    }

    if (filters.status) {
      filteredTasks = filteredTasks.filter(t => t.status === filters.status);
    }

    if (filters.assigneeId) {
      filteredTasks = filteredTasks.filter(t => t.assigneeId === parseInt(filters.assigneeId));
    }

    if (filters.priority) {
      filteredTasks = filteredTasks.filter(t => t.priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTasks = filteredTasks.filter(t => 
        t.title.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
      );
    }

    return filteredTasks;
  }

  async getById(id) {
    await delay(200);
    const task = this.tasks.find(t => t.Id === parseInt(id));
    if (!task) {
      throw new Error("Task not found");
    }
    return { ...task };
  }

  async create(taskData) {
    await delay(400);
    const newId = Math.max(...this.tasks.map(t => t.Id)) + 1;
    const newTask = {
      Id: newId,
      ...taskData,
      createdAt: new Date().toISOString(),
      position: this.getNextPosition(taskData.status)
    };
    this.tasks.push(newTask);
    return { ...newTask };
  }

  async update(id, taskData) {
    await delay(350);
    const index = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Task not found");
    }
    this.tasks[index] = { ...this.tasks[index], ...taskData };
    return { ...this.tasks[index] };
  }

  async delete(id) {
    await delay(300);
    const index = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Task not found");
    }
    this.tasks.splice(index, 1);
    return { success: true };
  }

  async getTaskStats() {
    await delay(250);
    const todoTasks = this.tasks.filter(t => t.status === "todo");
    const inProgressTasks = this.tasks.filter(t => t.status === "in-progress");
    const doneTasks = this.tasks.filter(t => t.status === "done");
    const overdueTasks = this.tasks.filter(t => 
      new Date(t.dueDate) < new Date() && t.status !== "done"
    );

    return {
      totalTasks: this.tasks.length,
      todoTasks: todoTasks.length,
      inProgressTasks: inProgressTasks.length,
      doneTasks: doneTasks.length,
      overdueTasks: overdueTasks.length
    };
  }

  getNextPosition(status) {
    const tasksWithStatus = this.tasks.filter(t => t.status === status);
    return tasksWithStatus.length > 0 ? Math.max(...tasksWithStatus.map(t => t.position)) + 1 : 1;
  }
}

export default new TaskService();