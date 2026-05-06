const API_BASE_URL = 'https://testing-app-3.onrender.com/api';

export const todoAPI = {
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
};
