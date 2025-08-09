// src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Import the entire UI application from ui.tsx.
// It's the default export, which we'll call UIApp.
import UIApp from './ui';

// Import the 3D canvas component from viewer.tsx
import BabylonCanvas from './viewer';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <div className="app-container">
      {/* A wrapper for the UI */}
      <div className="ui-wrapper">
        <UIApp />
      </div>

      {/* A wrapper for the 3D Viewer */}
      <div className="viewer-wrapper">
        <BabylonCanvas />
      </div>
    </div>
  </React.StrictMode>
);