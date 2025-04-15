// App.js
import React, { useState, useEffect } from 'react';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import Auth from './components/Auth';
import { useAuth } from './hooks/useAuth';
import { getCookie, setCookie } from './utils/cookie';
import { PRIORITIES, DEFAULT_PRIORITY } from './components/constants';
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
      } else {
        localStorage.removeItem('isGuest');
      }
    }

    if (user) {
      setIsGuestMode(false);
      fetchTodosFromSupabase();
      setStatus(`Logged in as ${user.email}`);
    } else {
      setIsGuestMode(false);
      setTodos([]);
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

  const handleSignOut = async () => {
    await signOut();
    setIsGuestMode(false);
    localStorage.removeItem('isGuest');
    setTodos([]);
    setStatus('Signed out successfully');
  };

  // Get data from Cookie
  const loadGuestTodos = () => {
    const storedTodos = getCookie(GUEST_TODOS_KEY);
    if (storedTodos) {
      try {
        const parsedTodos = JSON.parse(storedTodos);
        const todosWithPriority = parsedTodos.map(todo => ({
          ...todo,
          priority: todo.priority || DEFAULT_PRIORITY,
          id: todo.id || crypto.randomUUID()
        }));
        setTodos(todosWithPriority);
      } catch (e) {
        console.error("Failed to parse guest todos from cookie:", e);
        setTodos([]);
        setCookie(GUEST_TODOS_KEY, JSON.stringify([]), 7);
      }
    } else {
      setTodos([]);
    }
  };

  // Save data to Cookie
  const saveGuestTodos = (currentTodos) => {
    const todosToSave = currentTodos.map(todo => ({
      id: todo.id || crypto.randomUUID(),
      text: todo.text,
      completed: todo.completed,
      priority: todo.priority || DEFAULT_PRIORITY,
      created_at: todo.created_at || new Date().toISOString()
    }));
    setCookie(GUEST_TODOS_KEY, JSON.stringify(todosToSave), 7);
  };

  // Get data form Supabase
  const fetchTodosFromSupabase = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
      setStatus('Failed to load todos from server');
      setTodos([]);
    } else {
      const fetchedTodos = data.map(todo => ({
        ...todo,
        priority: todo.priority || DEFAULT_PRIORITY
      }));
      setTodos(fetchedTodos);
    }
  };

  // Add todo function
  const addTodo = async (text, priority) => {
    if (!text.trim()) {
      setStatus('Todo cannot be empty.');
      return;
    }
    const newTodoData = {
      text,
      priority: priority || DEFAULT_PRIORITY,
    };

    if (user) {
      const { data, error } = await supabase
        .from('todos')
        .insert({ ...newTodoData, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('Error adding todo:', error);
        setStatus(`Failed to add todo: ${error.message}`);
      } else if (data) {
        setTodos(prevTodos => [...prevTodos, data]);
        setStatus('Todo added successfully');
      }
    } else if (isGuestMode) {
      const newGuestTodo = {
        ...newTodoData,
        id: crypto.randomUUID(),
        completed: false,
        created_at: new Date().toISOString()
      };
      const updatedTodos = [...todos, newGuestTodo];
      setTodos(updatedTodos);
      saveGuestTodos(updatedTodos);
      setStatus('Todo added successfully (Guest Mode)');
    }
  };

  // Update function
  const updateTodo = async (updatedTodo) => {
    const fieldsToUpdate = {
      text: updatedTodo.text,
      completed: updatedTodo.completed,
    };

    if (user) {
      const { error } = await supabase
        .from('todos')
        .update(fieldsToUpdate)
        .eq('id', updatedTodo.id)
        .eq('user_id', user.id);
      if (error) {
        console.error('Error updating todo:', error);
        setStatus('Failed to update todo');
      } else {
        const updatedTodos = todos.map((todo) =>
          todo.id === updatedTodo.id ? { ...todo, ...fieldsToUpdate } : todo
        );
        setTodos(updatedTodos);
        setStatus('Todo updated successfully');
      }
    } else if (isGuestMode) {
      const updatedTodos = todos.map((todo) =>
        todo.id === updatedTodo.id ? { ...todo, ...fieldsToUpdate } : todo
      );
      setTodos(updatedTodos);
      saveGuestTodos(updatedTodos);
      setStatus('Todo updated successfully (Guest Mode)');
    }
  };

  // Delete function
  const deleteTodo = async (id) => {
    if (user) {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

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

  // Tampilan utama
  return (
    <div className="container">
      <h1>Tasky</h1>
      <p>A simple todo list web app created using create-react-app</p>

      {user || isGuestMode ? (
        <>
          { /* Form input */}
          <TodoForm onAdd={addTodo} />
          <ul>
            { /* Todo list */}
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
