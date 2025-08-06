import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

// Import the main assembler component from our new "bridge" file
import { StageSecond } from './isopenContext';

// Find the root element with the ID we set in our index.html
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <StageSecond />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element with id 'root'.");
}