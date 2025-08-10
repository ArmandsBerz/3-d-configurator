// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import global styles and main sass file.
// All layout CSS is now included in index.css.
import './index.css';
import './main.scss';

// Import the UI Layer and Rendering Layer components
import App from './ui';
import BabylonCanvas from './viewer';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

// Render the two layers as siblings within a main container.
// The layout rules in index.css will handle stacking them correctly.
root.render(
  <React.StrictMode>
    <div className="app-container">
      {/* --- RENDERING LAYER --- */}
      <div className="viewer-wrapper">
        <BabylonCanvas />
      </div>

      {/* --- UI LAYER --- */}
      <div className="ui-wrapper">
        <App />
      </div>
    </div>
  </React.StrictMode>
);
