import { ADD_TODO, REMOVE_TODO } from '../types';

export const addTodo = (todo) => ({
  type: ADD_TODO,
  payload: todo
});

export const removeTodo = (id) => ({
  type: REMOVE_TODO,
  payload: id
});
