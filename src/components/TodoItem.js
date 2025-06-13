import React, { useState } from 'react';
import { PRIORITIES, DEFAULT_PRIORITY } from './constants';

const TodoItem = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editPriority, setEditPriority] = useState(todo.priority || DEFAULT_PRIORITY);

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(todo.text);
    setEditPriority(todo.priority || DEFAULT_PRIORITY);
  };

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate({ ...todo, text: editText, priority: editPriority });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
          console.warn("Invalid date encountered in formatDateTime:", isoString);
          return 'Invalid date';
      }

      const optionsDate = { day: 'numeric', month: 'short', year: 'numeric' };
      const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: false };

      // Using 'id-ID' for Indonesian locale, fallback to default if needed
      const locale = 'id-ID';
      const formattedDate = date.toLocaleDateString(locale, optionsDate);
      const formattedTime = date.toLocaleTimeString(locale, optionsTime).replace('.',':');

      return `${formattedDate}, ${formattedTime}`;
    } catch (error) {
      console.error("Error formatting date:", error, "Input:", isoString);
      return 'Invalid date';
    }
  };

  const getPriorityInfo = (priority) => {
    const lowerPriority = priority?.toLowerCase() || DEFAULT_PRIORITY.toLowerCase();
    switch (lowerPriority) {
      case 'high': return { icon: '🔴', className: 'priority-high' };
      case 'medium': return { icon: '🟡', className: 'priority-medium' };
      case 'low': return { icon: '🟢', className: 'priority-low' };
      default: return { icon: '⚪', className: 'priority-medium' };
    }
  };

  const priorityInfo = getPriorityInfo(todo.priority);

  return (
    <li className="todo-item-li">
      {isEditing ? (
        // Edit Mode
        <div className="edit-container">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="edit-todo-input"
            aria-label="Edit todo text"
          />
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value)}
            className="edit-priority-select"
            aria-label="Edit todo priority"
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button onClick={handleSave} className="save-button">Save</button>
          <button onClick={handleCancel} className="cancel-button">Cancel</button>
        </div>
      ) : (
        // View Mode
        <div className="view-container">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onUpdate({ ...todo, completed: !todo.completed })}
            aria-labelledby={`todo-text-${todo.id}`}
          />
          <span
             className={`priority-icon ${priorityInfo.className}`}
             title={`Priority: ${todo.priority || DEFAULT_PRIORITY}`}
             aria-label={`Priority: ${todo.priority || DEFAULT_PRIORITY}`} >
            {priorityInfo.icon}
          </span>
          <div className="text-date-wrapper">
            <span
                id={`todo-text-${todo.id}`}
                className={`todo-text ${todo.completed ? 'completed' : ''}`}>
              {todo.text}
            </span>
            {todo.created_at && (
              <span className="todo-date">
                {formatDateTime(todo.created_at)}
              </span>
            )}
          </div>
          <div className="actions">
            <button onClick={handleEdit} className="edit-button">Edit</button>
            <button onClick={() => onDelete(todo.id)} className="delete-button">Delete</button>
          </div>
        </div>
      )}
    </li>
  );
};

export default TodoItem;