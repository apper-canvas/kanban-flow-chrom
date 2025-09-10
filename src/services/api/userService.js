import usersData from "@/services/mockData/users.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class UserService {
  constructor() {
    this.users = [...usersData];
  }

  async getAll() {
    await delay(200);
    return [...this.users];
  }

  async getById(id) {
    await delay(150);
    const user = this.users.find(u => u.Id === parseInt(id));
    if (!user) {
      throw new Error("User not found");
    }
    return { ...user };
  }

  async create(userData) {
    await delay(350);
    const newId = Math.max(...this.users.map(u => u.Id)) + 1;
    const newUser = {
      Id: newId,
      ...userData
    };
    this.users.push(newUser);
    return { ...newUser };
  }

  async update(id, userData) {
    await delay(300);
    const index = this.users.findIndex(u => u.Id === parseInt(id));
    if (index === -1) {
      throw new Error("User not found");
    }
    this.users[index] = { ...this.users[index], ...userData };
    return { ...this.users[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.users.findIndex(u => u.Id === parseInt(id));
    if (index === -1) {
      throw new Error("User not found");
    }
    this.users.splice(index, 1);
    return { success: true };
  }

  async getUsersByProject(projectId) {
    await delay(200);
    // This would typically join with project data
    // For now, return all users as they could be assigned to any project
    return [...this.users];
  }
}

export default new UserService();