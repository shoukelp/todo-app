// components/TodoForm.js
import React, { useState } from 'react';

const TodoForm = ({ onAdd }) => {
    const [text, setText] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onAdd(text);
            setText('');
            setError('');
        } else {
            setError('Todo cannot be empty.');
        }
    };

    return (
        <div>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Add new todo"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button type="submit">Add</button>
            </form>
        </div>
    );
};

export default TodoForm;