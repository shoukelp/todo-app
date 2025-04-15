// components/TodoItem.js
import React, { useState } from 'react';
import { DEFAULT_PRIORITY } from './constants';

const TodoItem = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(todo.text);
  };

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate({ ...todo, text: editText });
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
          return 'Invalid date';
      }
      const optionsDate = { day: 'numeric', month: 'short', year: 'numeric' };
      const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: false };

      const formattedDate = date.toLocaleDateString('id-ID', optionsDate);
      const formattedTime = date.toLocaleTimeString('id-ID', optionsTime);

      return `${formattedDate}, ${formattedTime}`;
    } catch (error) {
      console.error("Error formatting date:", error);
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
    <li className="todo-item-li"> { }
      {isEditing ? (
        <div className="edit-container">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          { }
          { }
          <button onClick={handleSave} className="save-button">Save</button>
          <button onClick={handleCancel} className="cancel-button">Cancel</button>
        </div>
      ) : (
        <div className="view-container">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onUpdate({ ...todo, completed: !todo.completed })}
          />
          { }
          <span className={`priority-icon ${priorityInfo.className}`} title={`Priority: ${todo.priority || DEFAULT_PRIORITY}`}>
            {priorityInfo.icon}
          </span>
          { }
          <div className="text-date-wrapper">
            <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
              {todo.text}
            </span>
            { }
            {todo.created_at && (
              <span className="todo-date">
                {formatDateTime(todo.created_at)}
              </span>
            )}
          </div>
          { }
          { }
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