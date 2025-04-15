// components/TodoForm.js
import React, { useState } from 'react';
import { PRIORITIES, DEFAULT_PRIORITY } from './constants';

// Component for the form used to add new todo items
const TodoForm = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState(DEFAULT_PRIORITY);
  const [error, setError] = useState('');

  // Handles the form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      // If text is not empty after trimming whitespace
      onAdd(text, priority);
      setText('');
      setPriority(DEFAULT_PRIORITY);
      setError('');
    } else {
      // If text is empty or only whitespace
      setError('Todo cannot be empty.');
    }
  };

  // Render the form
  return (
    <div>
      {/* Display error message if the error state is not empty */}
      {error && <p className="error-message">{error}</p>}

      {/* Todo creation form */}
      <form onSubmit={handleSubmit} className="todo-form">
        {/* Text input for the new todo */}
        <input
          type="text"
          placeholder="Add new todo"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="todo-input"
        />

        {/* Priority selection dropdown */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="priority-select"
        >
          {/* Map through defined priorities to create options */}
          {PRIORITIES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Submit button */}
        <button type="submit" className="add-button">Add</button>
      </form>
    </div>
  );
};

export default TodoForm;