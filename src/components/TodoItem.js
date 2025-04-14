// components/TodoItem.js
import React, { useState } from 'react';

const TodoItem = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate({ ...todo, text: editText });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  return (
    <li>
      {isEditing ? (
        <div className="edit-container">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
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
          <span className={todo.completed ? 'completed' : ''}>{todo.text}</span>
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