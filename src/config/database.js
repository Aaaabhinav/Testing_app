// PostgreSQL Database Configuration
// This connects to a PostgreSQL backend via REST API
// For production, deploy a simple Express + PostgreSQL API

const API_BASE_URL = 'http://10.0.2.2:3000/api'; // Android emulator localhost
// const API_BASE_URL = 'http://localhost:3000/api'; // iOS simulator
// const API_BASE_URL = 'https://your-deployed-api.com/api'; // Production

export const todoAPI = {
  // Fetch all todos for a user
  async getTodos(userId, token) {
    const response = await fetch(`${API_BASE_URL}/todos?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch todos');
    return response.json();
  },

  // Create a new todo
  async createTodo(userId, title, token) {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, title }),
    });
    if (!response.ok) throw new Error('Failed to create todo');
    return response.json();
  },

  // Toggle todo completion
  async toggleTodo(todoId, completed, token) {
    const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed }),
    });
    if (!response.ok) throw new Error('Failed to update todo');
    return response.json();
  },

  // Delete a todo
  async deleteTodo(todoId, token) {
    const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to delete todo');
    return response.json();
  },

  // Update todo title
  async updateTodo(todoId, title, token) {
    const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error('Failed to update todo');
    return response.json();
  },
};

export { API_BASE_URL };
