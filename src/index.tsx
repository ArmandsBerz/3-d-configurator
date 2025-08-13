// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import './main.scss';

// Only import the main App component. It controls both the UI and 3D layers.
// Make sure this path points to your file (e.g., './App' or './ui').
import App from './ui';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

// Now, you only need to render the single <App /> component.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);