import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, LogOut, CheckCircle2, Plus, Trash2, Check, AlertCircle, ClipboardList } from 'lucide-react';
import { AuthProvider, useAuth } from './AuthContext';
import { todoAPI } from './database';
import './index.css';

function LoginScreen() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in">
      <div className="logo-container">
        <div className="logo-box">
          <CheckCircle2 size={40} />
        </div>
      </div>
      
      <h1 className="title">TaskFlow</h1>
      <p className="subtitle">
        {isLogin ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
      </p>

      {error && (
        <div className="error-msg animate-fade-in">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input
              type="text"
              className="input-field"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="input-group">
          <Mail className="input-icon" size={20} />
          <input
            type="email"
            className="input-field"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <Lock className="input-icon" size={20} />
          <input
            type="password"
            className="input-field"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div style={{ textAlign: 'center' }}>
        <button 
          className="text-button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span>{isLogin ? 'Sign Up' : 'Sign In'}</span>
        </button>
      </div>
    </div>
  );
}

function TodoApp() {
  const { user, logout, getToken } = useAuth();
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const token = await getToken();
      const data = await todoAPI.getTodos(user.uid, token);
      setTodos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const title = newTodo.trim();
    setNewTodo(''); // optimistic clear
    
    try {
      const token = await getToken();
      const added = await todoAPI.createTodo(user.uid, title, token);
      setTodos([added, ...todos]);
    } catch (err) {
      console.error(err);
      fetchTodos(); // revert if failed
    }
  };

  const handleToggle = async (todoId, currentStatus) => {
    setTodos(todos.map(t => t.id === todoId ? { ...t, completed: !currentStatus } : t));
    
    try {
      const token = await getToken();
      await todoAPI.toggleTodo(todoId, !currentStatus, token);
    } catch (err) {
      console.error(err);
      fetchTodos(); // revert
    }
  };

  const handleDelete = async (todoId) => {
    if (!window.confirm('Delete this task?')) return;
    
    setTodos(todos.filter(t => t.id !== todoId));
    try {
      const token = await getToken();
      await todoAPI.deleteTodo(todoId, token);
    } catch (err) {
      console.error(err);
      fetchTodos(); // revert
    }
  };

  const completedCount = todos.filter(t => t.completed).length;

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '520px' }}>
      <header className="app-header">
        <div>
          <h2 className="greeting-text">Hello, {user.displayName || 'there'} 👋</h2>
          <p className="date-text">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={logout} className="icon-btn" title="Sign Out">
          <LogOut size={20} />
        </button>
      </header>

      <div className="stats-card">
        <div className="stats-info">
          <span>Daily Progress</span>
          <h3><strong>{completedCount}</strong> / {todos.length} done</h3>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button 
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      <div className="todo-list">
        {loading ? (
          <div className="empty-state">Loading tasks...</div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} />
            <h3>{filter === 'all' ? 'No tasks yet' : filter === 'active' ? 'No active tasks' : 'No completed tasks'}</h3>
            <p>{filter === 'all' ? 'Add your first task below!' : 'Keep going! 🚀'}</p>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <div 
                className="todo-checkbox" 
                onClick={() => handleToggle(todo.id, todo.completed)}
              >
                {todo.completed && <Check size={16} color="white" />}
              </div>
              <span className="todo-text">{todo.title}</span>
              <button className="todo-delete" onClick={() => handleDelete(todo.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      <form className="add-todo" onSubmit={handleAdd}>
        <input
          type="text"
          className="input-field"
          placeholder="Add a new task..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button type="submit" className="add-btn" disabled={!newTodo.trim()}>
          <Plus size={24} />
        </button>
      </form>
    </div>
  );
}

function MainContent() {
  const { user } = useAuth();
  
  return (
    <div className="app-container">
      <div className="bg-circles">
        <div className="circle-1"></div>
        <div className="circle-2"></div>
      </div>
      {user ? <TodoApp /> : <LoginScreen />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
