// App.js
import React, { useState, useEffect } from 'react';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import Auth from './components/Auth';
import { useAuth } from './hooks/useAuth';
import { getCookie, setCookie, deleteCookie } from './utils/cookie';
import { PRIORITIES, DEFAULT_PRIORITY } from './components/constants';
import './App.css';
import { Routes, Route } from 'react-router-dom';

// Main application view (Todos list or Auth)
const MainApp = () => {
  const [todos, setTodos] = useState([]);
  const { user, signOut, supabase } = useAuth();
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [status, setStatus] = useState('Loading application...');
  const GUEST_TODOS_KEY = 'guestTodos';

  // Effect to handle user authentication state changes and guest mode logic
  useEffect(() => {
    // console.log("Auth State/Mount Effect: Current user:", user); // Optional debug log
    const storedGuest = localStorage.getItem('isGuest');

    if (user) {
      // User is logged in: Clear guest state, load Supabase data
      // console.log("User detected. Clearing guest status, fetching Supabase data.");
      if (isGuestMode) setIsGuestMode(false);
      localStorage.removeItem('isGuest');
      deleteCookie(GUEST_TODOS_KEY);
      fetchTodosFromSupabase();
      // Status is set within fetchTodosFromSupabase or if error occurs
    } else if (storedGuest === 'true') {
      // No user, but guest flag exists: Enter guest mode
      // console.log("No user, but guest flag found. Entering Guest Mode.");
      setIsGuestMode(true);
      loadGuestTodos();
      setStatus('Guest Mode');
    } else {
      // No user, no guest flag: Show Auth component
      // console.log("No user or guest flag. Displaying Auth page.");
      if (isGuestMode) setIsGuestMode(false);
      setTodos([]);
      setStatus('Please log in or continue as Guest');
    }
    // This effect should primarily react to changes in the user object
  }, [user]); // Only re-run the effect if the user object changes

  // --- Guest Mode Management ---

  // Called when 'Continue as Guest' button is clicked in Auth component
  const handleGuestSignIn = () => {
    // console.log("Handling Guest Sign In");
    localStorage.setItem('isGuest', 'true');
    setIsGuestMode(true);
    // Let useEffect handle loading/status based on new state
  };

  // Called when 'Back to Login' link is clicked in Guest Mode
  const handleBackToLogin = () => {
    // console.log("Handling Back to Login from Guest Mode");
    localStorage.removeItem('isGuest');
    deleteCookie(GUEST_TODOS_KEY);
    setIsGuestMode(false);
    // Let useEffect handle clearing todos and setting status
  };

  // Load guest todos from cookie storage
  const loadGuestTodos = () => {
    // console.log("Loading guest todos from cookie");
    setStatus('Loading guest tasks...');
    const storedTodos = getCookie(GUEST_TODOS_KEY);
    if (storedTodos) {
      try {
        const parsedTodos = JSON.parse(storedTodos);
        // Ensure todos have default properties for robustness
        const todosWithDefaults = parsedTodos.map(todo => ({
          id: todo.id || crypto.randomUUID(),
          text: todo.text || '',
          completed: todo.completed || false,
          priority: todo.priority || DEFAULT_PRIORITY,
          created_at: todo.created_at || new Date().toISOString()
        }));
        setTodos(todosWithDefaults);
        // console.log("Guest todos loaded:", todosWithDefaults.length);
      } catch (e) {
        console.error("Failed to parse guest todos from cookie:", e);
        setTodos([]);
        setCookie(GUEST_TODOS_KEY, JSON.stringify([]), 7); // Reset cookie on error
         setStatus('Error loading guest tasks.');
      }
    } else {
      // console.log("No guest todos found in cookie");
      setTodos([]);
    }
     // Status will be updated by useEffect or subsequent actions
  };

  // Save current guest todos list to cookie storage
  const saveGuestTodos = (currentTodos) => {
    // console.log("Saving guest todos to cookie");
    const todosToSave = currentTodos.map(todo => ({
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      priority: todo.priority,
      created_at: todo.created_at
    }));
    setCookie(GUEST_TODOS_KEY, JSON.stringify(todosToSave), 7); // 7-day expiry
    // console.log("Guest todos saved:", todosToSave.length);
  };


  // --- Supabase Data Management ---

  // Fetch todos for the logged-in user from Supabase
  const fetchTodosFromSupabase = async () => {
    if (!user) {
       // console.warn("fetchTodosFromSupabase called without a user."); // Optional warning
       return;
    }
    // console.log("Fetching Supabase todos for user:", user.id);
    setStatus('Loading tasks...');
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }); // Show newest first

    if (error) {
      console.error('Error fetching Supabase todos:', error);
      setStatus(`Failed to load tasks: ${error.message}`);
      setTodos([]);
    } else {
      // Ensure default priority if null in DB
      const fetchedTodos = data.map(todo => ({
        ...todo,
        priority: todo.priority || DEFAULT_PRIORITY
      }));
      setTodos(fetchedTodos);
      setStatus(`Logged in as ${user.email}`); // Update status after loading
      // console.log("Supabase todos fetched:", fetchedTodos.length);
    }
  };

  // Handle user sign out
  const handleSignOut = async () => {
    // console.log("Handling Sign Out");
    setStatus('Signing out...');
    const { error } = await signOut();
     if (error) {
        console.error("Sign out error:", error);
        setStatus(`Sign out failed: ${error.message}`);
     } else {
        // User state becomes null via AuthProvider, triggering useEffect
        // Clean up guest state redundantly just in case
        localStorage.removeItem('isGuest');
        deleteCookie(GUEST_TODOS_KEY);
        setIsGuestMode(false);
        setTodos([]);
        setStatus('Signed out successfully');
     }
  };


  // --- CRUD Operations ---

  // Add a new todo (handles both logged-in and guest users)
  const addTodo = async (text, priority) => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      // console.warn("Attempted to add empty todo"); // Optional warning
      return; // Prevent adding empty todos
    }
    const newTodoData = {
      text: trimmedText,
      priority: priority || DEFAULT_PRIORITY,
      completed: false
    };
    setStatus('Adding todo...');

    if (user) {
      // Add to Supabase
      // console.log("Adding todo to Supabase");
      const { data, error } = await supabase
        .from('todos')
        .insert({ ...newTodoData, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('Error adding todo to Supabase:', error);
        setStatus(`Failed to add todo: ${error.message}`);
      } else if (data) {
        setTodos(prevTodos => [ { ...data, priority: data.priority || DEFAULT_PRIORITY }, ...prevTodos]); // Prepend new todo
        setStatus('Todo added successfully');
        // console.log("Todo added to Supabase:", data.id);
      }
    } else if (isGuestMode) {
      // Add locally for guest
      // console.log("Adding todo for Guest");
      const newGuestTodo = {
        ...newTodoData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };
      const updatedTodos = [newGuestTodo, ...todos]; // Prepend new todo
      setTodos(updatedTodos);
      saveGuestTodos(updatedTodos);
      setStatus('Todo added successfully (Guest Mode)');
      // console.log("Guest todo added:", newGuestTodo.id);
    } else {
       // Should not happen if UI logic is correct, but good failsafe
       console.error("Cannot add todo: No user and not in guest mode.");
       setStatus("Cannot add todo. Please log in or use Guest mode.");
    }
  };

  // Update an existing todo (handles text, completion, priority)
  const updateTodo = async (updatedTodo) => {
    const fieldsToUpdate = {
      text: updatedTodo.text,
      completed: updatedTodo.completed,
      priority: updatedTodo.priority,
    };
    const todoId = updatedTodo.id;
    setStatus('Updating todo...');

    if (user) {
      // Update in Supabase
      // console.log("Updating todo in Supabase:", todoId);
      const { error } = await supabase
        .from('todos')
        .update(fieldsToUpdate)
        .eq('id', todoId)
        .eq('user_id', user.id); // Ensure ownership

      if (error) {
        console.error('Error updating todo in Supabase:', error);
        setStatus(`Failed to update todo: ${error.message}`);
      } else {
        // Update local state
        const updatedTodos = todos.map((todo) =>
          todo.id === todoId ? { ...todo, ...fieldsToUpdate } : todo
        );
        setTodos(updatedTodos);
        setStatus('Todo updated successfully');
        // console.log("Todo updated in Supabase:", todoId);
      }
    } else if (isGuestMode) {
      // Update locally for guest
      // console.log("Updating guest todo:", todoId);
      const updatedTodos = todos.map((todo) =>
        todo.id === todoId ? { ...todo, ...fieldsToUpdate } : todo
      );
      setTodos(updatedTodos);
      saveGuestTodos(updatedTodos);
      setStatus('Todo updated successfully (Guest Mode)');
      // console.log("Guest todo updated:", todoId);
    } else {
       console.error("Cannot update todo: No user and not in guest mode.");
       setStatus("Cannot update todo. Please log in or use Guest mode.");
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
     // Optional: Confirmation dialog
     // if (!window.confirm("Are you sure you want to delete this todo?")) return;
     setStatus('Deleting todo...');

    if (user) {
      // Delete from Supabase
      // console.log("Deleting todo from Supabase:", id);
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure ownership

      if (error) {
        console.error('Error deleting todo from Supabase:', error);
        setStatus(`Failed to delete todo: ${error.message}`);
      } else {
        // Remove from local state
        setTodos(currentTodos => currentTodos.filter((todo) => todo.id !== id));
        setStatus('Todo deleted successfully');
        // console.log("Todo deleted from Supabase:", id);
      }
    } else if (isGuestMode) {
      // Delete locally for guest
      // console.log("Deleting guest todo:", id);
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
      saveGuestTodos(updatedTodos);
      setStatus('Todo deleted successfully (Guest Mode)');
      // console.log("Guest todo deleted:", id);
    } else {
      console.error("Cannot delete todo: No user and not in guest mode.");
       setStatus("Cannot delete todo. Please log in or use Guest mode.");
    }
  };

  // --- Render Logic ---
  return (
    <div className="container">
      <h1>Tasky</h1>
      <p>A simple todo list web app using React & Supabase</p>

      {/* Display Auth component if not logged in AND not in guest mode */}
      {!user && !isGuestMode && (
        <Auth onGuestSignIn={handleGuestSignIn} />
      )}

      {/* Display Todo list and controls if logged in OR in guest mode */}
      {(user || isGuestMode) && (
        <>
          <TodoForm onAdd={addTodo} />
          {todos.length > 0 ? (
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
           ) : (
             // Display message if list is empty or loading
             <p style={{ fontStyle: 'italic', color: '#888', marginTop: '30px' }}>
               {status.startsWith('Loading') ? 'Loading...' : 'No tasks yet. Add one above!'}
             </p>
           )
          }
          {/* Status Area with conditional links */}
          <div className="status-area">
             <p className="status-text">
              {status}
              {/* Show Sign Out only if logged in */}
              {user && (
                <>
                  <span>|</span>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleSignOut(); }} className="status-link">Sign Out</a>
                </>
              )}
              {/* Show Back to Login only if in Guest Mode */}
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

// Root App component setting up the Router
const App = () => {
  return (
    <Routes>
      {/* Main route renders the core application logic */}
      <Route path="/" element={<MainApp />} />
      {/* Add other application routes here if needed */}
    </Routes>
  );
};

export default App;