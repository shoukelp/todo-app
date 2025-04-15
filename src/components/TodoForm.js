// components/TodoForm.js
import React, { useState } from 'react';
import { PRIORITIES, DEFAULT_PRIORITY } from './constants';

const TodoForm = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState(DEFAULT_PRIORITY);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text, priority);
      setText('');
      setPriority(DEFAULT_PRIORITY);
      setError('');
    } else {
      setError('Todo cannot be empty.');
    }
  };

  return (
    <div>
      {error && <p className="error-message">{error}</p>}
      { }
      <form onSubmit={handleSubmit} className="todo-form">
        <input
          type="text"
          placeholder="Add new todo"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="todo-input"
        />
        { }
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="priority-select"
        >
          {PRIORITIES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button type="submit" className="add-button">Add</button>
      </form>
    </div>
  );
};

export default TodoForm;