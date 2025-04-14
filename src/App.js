// App.js
import React, { useState, useEffect } from 'react';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import Auth from './components/Auth';
import { useAuth } from './hooks/useAuth';
import { getCookie, setCookie } from './utils/cookie';
import './App.css';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

const MainApp = () => {
  const [todos, setTodos] = useState([]);
  const { user, signOut, supabase } = useAuth();
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [status, setStatus] = useState('Loading application...');
  const GUEST_TODOS_KEY = 'guestTodos';

  useEffect(() => {
    const storedGuest = localStorage.getItem('isGuest');
    if (storedGuest === 'true') {
      if (!user) {
        setIsGuestMode(true);
        loadGuestTodos();
        setStatus('Guest Mode');
        return;
      }
    }

    if (user) {
      setIsGuestMode(false);
      localStorage.removeItem('isGuest');
      fetchTodosFromSupabase();
      setStatus(`Logged in as ${user.email}`);
    } else {
      setIsGuestMode(false);
      setStatus('Please log in or continue as Guest');
    }
  }, [user]);

  const handleGuestSignIn = () => {
    setIsGuestMode(true);
    localStorage.setItem('isGuest', 'true');
    loadGuestTodos();
    setStatus('Guest Mode');
  };

  const handleBackToLogin = () => {
    setIsGuestMode(false);
    localStorage.removeItem('isGuest');
    setTodos([]);
    setStatus('Back to login page');
  };

  const handleSignOut = () => {
    signOut();
    setIsGuestMode(false);
    localStorage.removeItem('isGuest');
    setTodos([]);
    setStatus('Signed out successfully');
  };

  const loadGuestTodos = () => {
    const storedTodos = getCookie(GUEST_TODOS_KEY);
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
  };

  const saveGuestTodos = (currentTodos) => {
    setCookie(GUEST_TODOS_KEY, JSON.stringify(currentTodos), 7);
  };

  const fetchTodosFromSupabase = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
      setStatus('Failed to load todos from server');
    } else {
      setTodos(data);
    }
  };

  const addTodo = async (text) => {
    if (!text.trim()) {
      setStatus('Todo cannot be empty.');
      return;
    }

    if (user) {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ user_id: user.id, text }])
        .select();

      if (error) {
        console.error('Error adding todo:', error);
        setStatus('Failed to add todo');
      } else {
        setTodos([...todos, data[0]]);
        setStatus('Todo added successfully');
      }
    } else if (isGuestMode) {
      const newTodo = { id: Date.now(), text, completed: false };
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      saveGuestTodos(updatedTodos);
      setStatus('Todo added successfully (Guest Mode)');
    }
  };

  const updateTodo = async (updatedTodo) => {
    if (user) {
      const { error } = await supabase
        .from('todos')
        .update({ text: updatedTodo.text, completed: updatedTodo.completed })
        .eq('id', updatedTodo.id);

      if (error) {
        console.error('Error updating todo:', error);
        setStatus('Failed to update todo');
      } else {
        const updatedTodos = todos.map((todo) =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        );
        setTodos(updatedTodos);
        setStatus('Todo updated successfully');
      }
    } else if (isGuestMode) {
      const updatedTodos = todos.map((todo) =>
        todo.id === updatedTodo.id ? updatedTodo : todo
      );
      setTodos(updatedTodos);
      saveGuestTodos(updatedTodos);
      setStatus('Todo updated successfully (Guest Mode)');
    }
  };

  const deleteTodo = async (id) => {
    if (user) {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting todo:', error);
        setStatus('Failed to delete todo');
      } else {
        setTodos(todos.filter((todo) => todo.id !== id));
        setStatus('Todo deleted successfully');
      }
    } else if (isGuestMode) {
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
      saveGuestTodos(updatedTodos);
      setStatus('Todo deleted successfully (Guest Mode)');
    }
  };

  return (
    <div className="container">
      <h1>Tasky</h1>
      <p>A simple todo list web app created using create-react-app</p>

      {user || isGuestMode ? (
        <>
          <TodoForm onAdd={addTodo} />
          <ul>
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={updateTodo}
                onDelete={deleteTodo}
              />
            ))}
          </ul>
          <div className="status-area">
            <p className="status-text">
              {status}
              {user && (
                <>
                  <span> | </span>
                  <a href="#" onClick={handleSignOut} className="status-link">Sign Out</a>
                </>
              )}
              {isGuestMode && (
                <>
                  <span> | </span>
                  <a href="#" onClick={handleBackToLogin} className="status-link">Back to Login</a>
                </>
              )}
            </p>
          </div>
        </>
      ) : (
        <Auth onGuestSignIn={handleGuestSignIn} />
      )}
    </div>
  );
};

const AuthCallback = () => {
  const { supabase } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      await supabase.auth.getSession();
      navigate('/');
    };
    handleCallback();
  }, [supabase, navigate]);

  return <p>Processing login, please wait...</p>;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
};

export default App;
