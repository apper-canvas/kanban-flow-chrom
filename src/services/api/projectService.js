import projectsData from "@/services/mockData/projects.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ProjectService {
  constructor() {
    this.projects = [...projectsData];
  }

  async getAll() {
    await delay(300);
    return [...this.projects];
  }

  async getById(id) {
    await delay(200);
    const project = this.projects.find(p => p.Id === parseInt(id));
    if (!project) {
      throw new Error("Project not found");
    }
    return { ...project };
  }

  async create(projectData) {
    await delay(400);
    const newId = Math.max(...this.projects.map(p => p.Id)) + 1;
    const newProject = {
      Id: newId,
      ...projectData,
      createdAt: new Date().toISOString(),
      progress: 0
    };
    this.projects.push(newProject);
    return { ...newProject };
  }

  async update(id, projectData) {
    await delay(350);
    const index = this.projects.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Project not found");
    }
    this.projects[index] = { ...this.projects[index], ...projectData };
    return { ...this.projects[index] };
  }

  async delete(id) {
    await delay(300);
    const index = this.projects.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Project not found");
    }
    this.projects.splice(index, 1);
    return { success: true };
  }

  async getProjectStats() {
    await delay(250);
    const activeProjects = this.projects.filter(p => p.status === "active");
    const completedProjects = this.projects.filter(p => p.status === "completed");
    const totalProgress = this.projects.reduce((sum, p) => sum + p.progress, 0);
    const averageProgress = this.projects.length > 0 ? Math.round(totalProgress / this.projects.length) : 0;
    
    return {
      totalProjects: this.projects.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      averageProgress
    };
  }
}

export default new ProjectService();