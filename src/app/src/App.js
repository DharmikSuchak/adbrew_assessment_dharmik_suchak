import React, { useState, useEffect } from 'react';
import './App.css';

export function App() {
  const [todos, setTodos] = useState([]);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('http://localhost:8000/todos/');
      if (!response.ok) {
        throw new Error('Failed to fetch TODOs');
      }
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const response = await fetch('http://localhost:8000/todos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });
      if (!response.ok) {
        throw new Error('Failed to create TODO');
      }
      setDescription('');
      await fetchTodos(); // Refetch list after successful submission
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="App">
      <div>
        <h1>List of TODOs</h1>
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
        {isLoading ? (
          <p>Loading TODOs...</p>
        ) : (
          <ul>
            {todos.length === 0 ? (
              <li>No TODOs yet!</li>
            ) : (
              todos.map(todo => (
                <li key={todo.id}>{todo.description}</li>
              ))
            )}
          </ul>
        )}
      </div>
      <div>
        <h1>Create a ToDo</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="todo">ToDo: </label>
            <input 
              id="todo"
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div style={{"marginTop": "5px"}}>
            <button type="submit" disabled={isSubmitting || !description.trim()}>
              {isSubmitting ? 'Adding...' : 'Add ToDo!'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
