// components/TodoItem.js
import React, { useState } from 'react';
import { PRIORITIES, DEFAULT_PRIORITY } from './constants';

// Component to display and manage a single todo item
const TodoItem = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editPriority, setEditPriority] = useState(todo.priority || DEFAULT_PRIORITY);

  // Switches the component to edit mode
  const handleEdit = () => {
    setIsEditing(true);
    // Initialize edit states with current todo values
    setEditText(todo.text);
    setEditPriority(todo.priority || DEFAULT_PRIORITY);
  };

  // Saves the changes made in edit mode
  const handleSave = () => {
    // Check if the edited text is not just empty spaces
    if (editText.trim()) {
      onUpdate({ ...todo, text: editText, priority: editPriority });
      setIsEditing(false); // Exit edit mode
    }
    // Optional: Add feedback if the text is empty
    // else { console.warn("Todo text cannot be empty during save."); }
  };

  // Cancels the edit mode without saving changes
  const handleCancel = () => {
    setIsEditing(false);
  };

  // Formats an ISO date string into a locale-specific date and time string (e.g., '15 Apr 2025, 12:26')
  // Includes fallback for potentially non-standard date strings (e.g., from guest cookies).
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      // Check if the initial parsing resulted in a valid date
      if (isNaN(date.getTime())) {
           // Attempt manual parsing for formats like yyyy-MM-ddTHH:mm:ss.sssZ
           const parts = isoString.split(/[-T:.Z]/);
            if (parts.length >= 6) {
              const manualDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]));
              // If manual parsing is successful, format the valid ISO string
              if (!isNaN(manualDate.getTime())) return formatDateTime(manualDate.toISOString());
            }
          return 'Invalid date';
      }
      // Define date and time formatting options
      const optionsDate = { day: 'numeric', month: 'short', year: 'numeric' };
      const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: false };

      // Format date and time using 'id-ID' locale (adjust if needed)
      const formattedDate = date.toLocaleDateString('id-ID', optionsDate);
      const formattedTime = date.toLocaleTimeString('id-ID', optionsTime);

      return `${formattedDate}, ${formattedTime}`;
    } catch (error) {
      console.error("Error formatting date:", error, "Input:", isoString);
      return 'Invalid date';
    }
  };

  // Determines the appropriate icon and CSS class based on the todo's priority level
  const getPriorityInfo = (priority) => {
    const lowerPriority = priority?.toLowerCase() || DEFAULT_PRIORITY.toLowerCase();
    switch (lowerPriority) {
      case 'high': return { icon: '🔴', className: 'priority-high' };
      case 'medium': return { icon: '🟡', className: 'priority-medium' };
      case 'low': return { icon: '🟢', className: 'priority-low' };
      default: return { icon: '⚪', className: 'priority-medium' };
    }
  };

  // Get the display information for the current todo's priority
  const priorityInfo = getPriorityInfo(todo.priority);

  // Render the list item
  return (
    <li className="todo-item-li">
      {isEditing ? (
        // --- Edit Mode ---
        <div className="edit-container">
          {/* Text input for editing */}
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="edit-todo-input"
          />
          {/* Priority selection dropdown for editing */}
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value)}
            className="edit-priority-select"
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {/* Action buttons for edit mode */}
          <button onClick={handleSave} className="save-button">Save</button>
          <button onClick={handleCancel} className="cancel-button">Cancel</button>
        </div>
      ) : (
        // --- View Mode ---
        <div className="view-container">
          {/* Checkbox for marking todo as complete/incomplete */}
          <input
            type="checkbox"
            checked={todo.completed}
            // Call onUpdate directly for completion toggle
            onChange={() => onUpdate({ ...todo, completed: !todo.completed })}
          />
          {/* Priority indicator icon */}
          <span className={`priority-icon ${priorityInfo.className}`} title={`Priority: ${todo.priority || DEFAULT_PRIORITY}`}>
            {priorityInfo.icon}
          </span>
          {/* Wrapper for todo text and creation date */}
          <div className="text-date-wrapper">
            <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
              {todo.text}
            </span>
            {/* Display formatted creation date if available */}
            {todo.created_at && (
              <span className="todo-date">
                {formatDateTime(todo.created_at)}
              </span>
            )}
          </div>
          {/* Action buttons for view mode */}
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