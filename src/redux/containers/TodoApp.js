import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addTodo, removeTodo } from '../actions/todoActions';
import TodoList from '../../components/TodoList';

const TodoApp = () => {
  const [todo, setTodo] = useState('');
  const todos = useSelector((state) => state.todos.todos);
  const dispatch = useDispatch();

  const handleAddTodo = () => {
    if (todo.trim()) {
      dispatch(addTodo({ id: Date.now(), text: todo }));
      setTodo('');
    }
  };

  const handleRemoveTodo = (id) => {
    dispatch(removeTodo(id));
  };

  const buttonStyle = {
    margin: '10px', 
    position: 'relative', 
    top: '-4px' 
};

  return (
    <div className="container-fluid">
      <h1>Todo List</h1>
      <input
        type="text"
        data-role="input"
        value={todo}
        onChange={(e) => setTodo(e.target.value)}
      />
      <button className="button primary "onClick={handleAddTodo}
      style={buttonStyle}>Add Todo</button>
      <TodoList todos={todos} onRemove={handleRemoveTodo} />
    </div>
  );
};

export default TodoApp;
