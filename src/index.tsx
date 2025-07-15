// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './main.scss';
import UI from './ui'; // You can now drop the .tsx extension

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <UI />
  </React.StrictMode>
);