import commentsData from "@/services/mockData/comments.json";
import userService from "@/services/api/userService";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CommentService {
  constructor() {
    this.comments = [...commentsData];
  }

  async getAll() {
    await delay(200);
    return [...this.comments];
  }

  async getByTaskId(taskId) {
    await delay(250);
    const taskComments = this.comments.filter(c => c.taskId === parseInt(taskId));
    
    // Enrich with user data
    const enrichedComments = await Promise.all(
      taskComments.map(async (comment) => {
        try {
          const author = await userService.getById(comment.authorId);
          return { ...comment, author };
        } catch (error) {
          return { ...comment, author: null };
        }
      })
    );

    return enrichedComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  async create(commentData) {
    await delay(300);
    const newId = Math.max(...this.comments.map(c => c.Id)) + 1;
    const newComment = {
      Id: newId,
      ...commentData,
      createdAt: new Date().toISOString()
    };
    this.comments.push(newComment);
    
    // Return enriched comment
    try {
      const author = await userService.getById(newComment.authorId);
      return { ...newComment, author };
    } catch (error) {
      return { ...newComment, author: null };
    }
  }

  async update(id, commentData) {
    await delay(250);
    const index = this.comments.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Comment not found");
    }
    this.comments[index] = { ...this.comments[index], ...commentData };
    return { ...this.comments[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.comments.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Comment not found");
    }
    this.comments.splice(index, 1);
    return { success: true };
  }
}

export default new CommentService();