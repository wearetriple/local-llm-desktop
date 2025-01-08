import '@mantine/core/styles.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import App from './app';
import './assets/main.css';

ReactDOM.createRoot(document.querySelector('#root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
