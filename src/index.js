import React from 'react';
import ReactDOM from 'react-dom/client'; 

import { Provider } from 'react-redux';
import store from './redux/store';
import TodoApp from '../src/redux/containers/TodoApp';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <TodoApp />
    </Provider>
  </React.StrictMode>
);