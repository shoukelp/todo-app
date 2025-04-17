// App.js
import React, { useState, useEffect, useMemo } from 'react';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import Auth from './components/Auth';
import { useAuth } from './hooks/useAuth';
import { getCookie, setCookie, deleteCookie } from './utils/cookie';
import { PRIORITIES, DEFAULT_PRIORITY } from './components/constants';
import './App.css';
import { Routes, Route } from 'react-router-dom';

// Filter and Sort Controls Component
const FilterControls = ({ filter, setFilter, sortBy, setSortBy }) => {
  return (
    <div className="filter-sort-controls">
      <div className="filter-group">
        <label htmlFor="filter">Show:</label>
        <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="sort-group">
        <label htmlFor="sort">Sort By:</label>
        <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date-desc">Date (Newest First)</option>
          <option value="date-asc">Date (Oldest First)</option>
          <option value="alpha-asc">Alphabetical (A-Z)</option>
          <option value="alpha-desc">Alphabetical (Z-A)</option>
          <option value="priority-desc">Priority (High to Low)</option>
          <option value="priority-asc">Priority (Low to High)</option>
        </select>
      </div>
    </div>
  );
};

// Main Application View
const MainApp = () => {
  const [todos, setTodos] = useState([]);
  const { user, signOut, supabase } = useAuth();
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [status, setStatus] = useState('Loading application...');
  const GUEST_TODOS_KEY = 'guestTodos';

  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'alpha-asc', 'alpha-desc'

  // Effect for Auth State and Guest Mode Logic
  useEffect(() => {
    const storedGuest = localStorage.getItem('isGuest');

    if (user) {
      if (isGuestMode) setIsGuestMode(false);
      localStorage.removeItem('isGuest');
      deleteCookie(GUEST_TODOS_KEY);
      fetchTodosFromSupabase();
      setFilter('all'); // Reset filter on login
      setSortBy('date-desc'); // Reset sort on login
    } else if (storedGuest === 'true') {
      setIsGuestMode(true);
      loadGuestTodos();
      setStatus('Guest Mode');
      setFilter('all'); // Reset filter on guest mode entry
      setSortBy('date-desc'); // Reset sort on guest mode entry
    } else {
      if (isGuestMode) setIsGuestMode(false);
      setTodos([]);
      setStatus('Please log in or continue as Guest');
    }
  }, [user]);

  // Guest Mode Management
  const handleGuestSignIn = () => {
    localStorage.setItem('isGuest', 'true');
    setIsGuestMode(true);
  };

  const handleBackToLogin = () => {
    localStorage.removeItem('isGuest');
    deleteCookie(GUEST_TODOS_KEY);
    setIsGuestMode(false);
  };

  const loadGuestTodos = () => {
    setStatus('Loading guest tasks...');
    const storedTodos = getCookie(GUEST_TODOS_KEY);
    if (storedTodos) {
      try {
        const parsedTodos = JSON.parse(storedTodos);
        const todosWithDefaults = parsedTodos.map(todo => ({
          id: todo.id || crypto.randomUUID(),
          text: todo.text || '',
          completed: todo.completed || false,
          priority: todo.priority || DEFAULT_PRIORITY,
          created_at: todo.created_at || new Date().toISOString()
        }));
        setTodos(todosWithDefaults);
      } catch (e) {
        console.error("Failed to parse guest todos:", e);
        setTodos([]);
        setCookie(GUEST_TODOS_KEY, JSON.stringify([]), 7);
        setStatus('Error loading guest tasks.');
      }
    } else {
      setTodos([]);
    }
  };

  const saveGuestTodos = (currentTodos) => {
    const todosToSave = currentTodos.map(todo => ({
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      priority: todo.priority,
      created_at: todo.created_at
    }));
    setCookie(GUEST_TODOS_KEY, JSON.stringify(todosToSave), 7);
  };

  // Supabase Data Management
  const fetchTodosFromSupabase = async () => {
    if (!user) return;
    setStatus('Loading tasks...');
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching Supabase todos:', error);
      setStatus(`Failed to load tasks: ${error.message}`);
      setTodos([]);
    } else {
      const fetchedTodos = data.map(todo => ({
        ...todo,
        priority: todo.priority || DEFAULT_PRIORITY
      }));
      setTodos(fetchedTodos);
      setStatus(`Logged in as ${user.email}`);
    }
  };

  // User Sign Out
  const handleSignOut = async () => {
    setStatus('Signing out...');
    const { error } = await signOut();
    if (error) {
      console.error("Sign out error:", error);
      setStatus(`Sign out failed: ${error.message}`);
    } else {
      localStorage.removeItem('isGuest');
      deleteCookie(GUEST_TODOS_KEY);
      setIsGuestMode(false);
      setTodos([]);
      setFilter('all');
      setSortBy('date-desc');
    }
  };

  // CRUD Operations
  const addTodo = async (text, priority) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const newTodoData = {
      text: trimmedText,
      priority: priority || DEFAULT_PRIORITY,
      completed: false
    };
    const optimisticId = crypto.randomUUID();
    const optimisticTodo = {
      ...newTodoData,
      id: optimisticId,
      created_at: new Date().toISOString(),
      user_id: user ? user.id : undefined
    };

    // Prepend to the local state immediately
    setTodos(prevTodos => [optimisticTodo, ...prevTodos]);
    setStatus('Adding todo...');

    if (user) {
      const { data, error } = await supabase
        .from('todos')
        .insert({ ...newTodoData, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('Error adding todo to Supabase:', error);
        setStatus(`Failed to add todo: ${error.message}`);
        setTodos(prevTodos => prevTodos.filter(t => t.id !== optimisticId));
      } else if (data) {
        setTodos(prevTodos => prevTodos.map(t =>
          t.id === optimisticId ? { ...data, priority: data.priority || DEFAULT_PRIORITY } : t
        ));
        setStatus('Todo added successfully');
      }
    } else if (isGuestMode) {
      saveGuestTodos([optimisticTodo, ...todos.filter(t => t.id !== optimisticId)]); // Save updated list
      setStatus('Todo added successfully (Guest Mode)');
    } else {
      console.error("Cannot add todo: No user and not in guest mode.");
      setStatus("Cannot add todo. Please log in or use Guest mode.");
      setTodos(prevTodos => prevTodos.filter(t => t.id !== optimisticId));
    }
  };

  const updateTodo = async (updatedTodo) => {
    const fieldsToUpdate = {
      text: updatedTodo.text,
      completed: updatedTodo.completed,
      priority: updatedTodo.priority,
    };
    const todoId = updatedTodo.id;

    const originalTodos = [...todos];
    const updatedTodosState = todos.map((todo) =>
      todo.id === todoId ? { ...todo, ...fieldsToUpdate } : todo
    );
    setTodos(updatedTodosState);
    setStatus('Updating todo...');

    if (user) {
      const { error } = await supabase
        .from('todos')
        .update(fieldsToUpdate)
        .eq('id', todoId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating todo in Supabase:', error);
        setStatus(`Failed to update todo: ${error.message}`);
        setTodos(originalTodos);
      } else {
        setStatus('Todo updated successfully');
        // State already updated optimistically
      }
    } else if (isGuestMode) {
      saveGuestTodos(updatedTodosState);
      setStatus('Todo updated successfully (Guest Mode)');
      // State already updated optimistically
    } else {
      console.error("Cannot update todo: No user and not in guest mode.");
      setStatus("Cannot update todo. Please log in or use Guest mode.");
      setTodos(originalTodos); // Revert
    }
  };

  const deleteTodo = async (id) => {
    // Optional: Confirmation dialog
    // if (!window.confirm("Are you sure you want to delete this todo?")) return;
    const originalTodos = [...todos];
    const updatedTodosState = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodosState);
    setStatus('Deleting todo...');

    if (user) {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting todo from Supabase:', error);
        setStatus(`Failed to delete todo: ${error.message}`);
        setTodos(originalTodos);
      } else {
        setStatus('Todo deleted successfully');
      }
    } else if (isGuestMode) {
      saveGuestTodos(updatedTodosState);
      setStatus('Todo deleted successfully (Guest Mode)');
    } else {
      console.error("Cannot delete todo: No user and not in guest mode.");
      setStatus("Cannot delete todo. Please log in or use Guest mode.");
      setTodos(originalTodos);
    }
  };


  // Filtering and Sorting Logic
  const filteredAndSortedTodos = useMemo(() => {
    let result = [...todos];

    if (filter === 'active') {
      result = result.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
      result = result.filter(todo => todo.completed);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
          return dateA - dateB;
        case 'alpha-asc':
          return (a.text || '').localeCompare(b.text || '');
        case 'alpha-desc':
          return (b.text || '').localeCompare(a.text || '');
        case 'priority-desc':
          return PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority);
        case 'priority-asc':
          return PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority);
        case 'date-desc':
        default:
          const dateADesc = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateBDesc = b.created_at ? new Date(b.created_at) : new Date(0);
          return dateBDesc - dateADesc;
      }
    });

    return result;
  }, [todos, filter, sortBy]);

  const completedTasksPercentage = useMemo(() => {
    if (todos.length === 0) return 0;
    const completedCount = todos.filter(todo => todo.completed).length;
    return (completedCount / todos.length) * 100;
  }, [todos]);

  // Render Logic 
  const renderEmptyListMessage = () => {
    if (status.startsWith('Loading')) {
      return 'Loading...';
    }
    if (todos.length === 0) {
      return 'No tasks yet. Add one above!';
    }
    if (filteredAndSortedTodos.length === 0 && todos.length > 0) {
      // This means filters are active but hide all todos
      return `No tasks match the current filter ('${filter}').`;
    }
    return '';
  };

  return (
    <div className="container">
      <h1>Tasky</h1>
      <p>A simple todo list web app using React & Supabase</p>

      {!user && !isGuestMode && (
        <Auth onGuestSignIn={handleGuestSignIn} />
      )}

      {(user || isGuestMode) && (
        <>
          <TodoForm onAdd={addTodo} />

          { }
          {todos.length > 0 && (
            <FilterControls
              filter={filter}
              setFilter={setFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          )}

          { }
          {/* Display the percentage */}
          <p>Tasks Completed: {completedTasksPercentage.toFixed(0)}%</p>

          { }
          {filteredAndSortedTodos.length > 0 ? (
            <ul>
              {filteredAndSortedTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                />
              ))}
            </ul>
          ) : (
            <p style={{ fontStyle: 'italic', color: '#888', marginTop: '30px', textAlign: 'center' }}>
              {renderEmptyListMessage()}
            </p>
          )
          }

          { }
          <div className="status-area">
            <p className="status-text">
              {status}
              {user && (
                <>
                  <span>|</span>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleSignOut(); }} className="status-link">Sign Out</a>
                </>
              )}
              {isGuestMode && (
                <>
                  <span>|</span>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleBackToLogin(); }} className="status-link">Back to Login</a>
                </>
              )}
            </p>
          </div>
        </>
      )}
      <div className='footer'>Copyright &copy; 2025 shoukelp</div>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
    </Routes>
  );
};

export default App;